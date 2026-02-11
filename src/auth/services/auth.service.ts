import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Auth } from '../entities/auth.entity';
import { SignupDto, LoginDto, AuthResponseDto, TokensDto } from '../dtos';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 회원가입
   */
  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    // 1. 이메일 중복 확인
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다');
    }

    // 2. 비밀번호 해싱
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. User 생성
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      nickname: dto.nickname,
    });

    await this.userRepo.save(user);

    // 4. 토큰 생성
    const tokens = await this.generateTokens(user.id, user.email);

    // 5. Auth 세션 저장 (FCM 토큰 포함)
    await this.saveAuthSession(user.id, tokens.refreshToken, dto.fcmToken);

    // 6. 응답
    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  /**
   * 로그인
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // 1. 사용자 조회
    const user = await this.userRepo.findOne({
      where: { email: dto.email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다',
      );
    }

    // 2. 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다',
      );
    }

    // 3. 토큰 생성
    const tokens = await this.generateTokens(user.id, user.email);

    // 4. Auth 레코드 생성/업데이트
    await this.saveAuthSession(user.id, tokens.refreshToken, dto.fcmToken);

    // 5. 응답
    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  /**
   * 로그아웃
   */
  async logout(userId: number): Promise<{ message: string }> {
    // Auth 레코드 비활성화
    const authRecord = await this.authRepo.findOne({
      where: { userId, isActive: true },
    });

    if (authRecord) {
      // 소프트 삭제 (비활성화)
      authRecord.isActive = false;
      await this.authRepo.save(authRecord);
    }

    return { message: '로그아웃되었습니다' };
  }

  /**
   * 토큰 갱신
   */
  async refresh(refreshToken: string): Promise<TokensDto> {
    try {
      // 1. Refresh Token 검증
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // 2. Auth 레코드 확인
      const authRecord = await this.authRepo.findOne({
        where: {
          userId: payload.sub,
          isActive: true,
        },
      });

      if (!authRecord) {
        throw new UnauthorizedException('유효하지 않은 Refresh Token입니다');
      }

      // 4. Refresh Token 해시 비교
      const isMatch = await bcrypt.compare(
        refreshToken,
        authRecord.refreshTokenHash,
      );

      if (!isMatch) {
        throw new UnauthorizedException('유효하지 않은 Refresh Token입니다');
      }

      // 5. Refresh Token 만료 확인
      if (new Date() > authRecord.refreshExpiresAt) {
        throw new UnauthorizedException('Refresh Token이 만료되었습니다');
      }

      // 6. 새 토큰 생성
      const tokens = await this.generateTokens(payload.sub, payload.email);

      // 7. Refresh Token 업데이트 (Rotation)
      await this.updateRefreshToken(authRecord.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('유효하지 않은 Refresh Token입니다');
    }
  }

  /**
   * JWT 토큰 생성
   */
  private async generateTokens(
    userId: number,
    email: string,
  ): Promise<TokensDto> {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      // Access Token (짧은 수명)
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
      }),
      // Refresh Token (긴 수명)
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Auth 세션 저장 (FCM 토큰 포함)
   */
  private async saveAuthSession(
    userId: number,
    refreshToken: string,
    fcmToken?: string,
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7일 후

    // 기존 세션 확인
    let authRecord = await this.authRepo.findOne({
      where: { userId },
    });

    if (authRecord) {
      // 업데이트
      authRecord.refreshTokenHash = refreshTokenHash;
      authRecord.refreshExpiresAt = refreshExpiresAt;
      authRecord.lastLoginAt = new Date();
      authRecord.isActive = true;

      // FCM 토큰이 제공되면 업데이트
      if (fcmToken) {
        authRecord.fcmToken = fcmToken;
      }
    } else {
      // 생성
      authRecord = this.authRepo.create({
        userId,
        refreshTokenHash,
        refreshExpiresAt,
        lastLoginAt: new Date(),
        isActive: true,
        fcmToken: fcmToken || null,
      });
    }

    await this.authRepo.save(authRecord);
  }

  /**
   * Refresh Token 업데이트
   */
  private async updateRefreshToken(
    authId: number,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await this.authRepo.update(authId, {
      refreshTokenHash,
      refreshExpiresAt,
    });
  }
}
