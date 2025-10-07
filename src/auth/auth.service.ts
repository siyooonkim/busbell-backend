import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Auth } from './auth.entity';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

const ACCESS_TTL = '1h';
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입 (email/password) + 세션 생성
  async registerLocal(
    email: string,
    password: string,
    deviceId: string, // 🚩 디바이스 기준 세션 필수면 required로 강제
    fcmToken?: string,
  ) {
    if (!deviceId) throw new BadRequestException('deviceId가 필요합니다.');

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('이미 사용중인 이메일입니다.');

    // 트랜잭션: 유저 생성 + 세션 생성(업서트) 원자화
    const { user, tokens } = await this.dataSource.transaction(
      async (manager) => {
        const hash = await bcrypt.hash(password, 12);

        const user = manager.create(User, {
          email,
          passwordHash: hash,
          fcmToken,
          isEmailVerified: false,
        });
        await manager.save(user);

        // 토큰 발급
        const payload = { userId: user.id, deviceId };
        const accessToken = this.jwtService.sign(payload, {
          expiresIn: ACCESS_TTL,
        });
        const refreshToken = this.jwtService.sign(payload, {
          expiresIn: '7d',
          secret:
            process.env.JWT_REFRESH_SECRET ||
            process.env.JWT_SECRET ||
            'busbell-secret',
        });
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        // 세션 업서트: (userId, deviceId) 유니크 키 기준
        await manager.getRepository(Auth).upsert(
          {
            userId: user.id,
            deviceId,
            refreshTokenHash,
            refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_MS),
            lastLoginAt: new Date(),
          },
          ['userId', 'deviceId'],
        );

        return {
          user,
          tokens: { accessToken, refreshToken },
        };
      },
    );

    return {
      user: { id: user.id, email: user.email },
      ...tokens,
    };
  }

  // 로그인 (email/password) + 세션 갱신(업서트)
  async loginLocal(email: string, password: string, deviceId: string) {
    if (!deviceId) throw new BadRequestException('deviceId가 필요합니다.');

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');

    const payload = { userId: user.id, deviceId };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TTL,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret:
        process.env.JWT_REFRESH_SECRET ||
        process.env.JWT_SECRET ||
        'busbell-secret',
    });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // 업서트로 세션 갱신
    await this.authRepo.upsert(
      {
        userId: user.id,
        deviceId,
        refreshTokenHash,
        refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        lastLoginAt: new Date(),
      },
      ['userId', 'deviceId'],
    );

    return { accessToken, refreshToken };
  }

  // 리프레시 토큰 재발급
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          process.env.JWT_SECRET ||
          'busbell-secret',
      });

      const { userId, deviceId } = payload;
      const session = await this.authRepo.findOne({
        where: { userId, deviceId },
      });
      if (!session?.refreshTokenHash) throw new UnauthorizedException();

      const isValid = await bcrypt.compare(
        refreshToken,
        session.refreshTokenHash,
      );
      if (!isValid) throw new UnauthorizedException('Invalid refresh token');

      if (
        session.refreshExpiresAt &&
        session.refreshExpiresAt.getTime() < Date.now()
      ) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const newPayload = { userId, deviceId };
      const newAccess = this.jwtService.sign(newPayload, {
        expiresIn: ACCESS_TTL,
      });
      const newRefresh = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
        secret:
          process.env.JWT_REFRESH_SECRET ||
          process.env.JWT_SECRET ||
          'busbell-secret',
      });

      session.refreshTokenHash = await bcrypt.hash(newRefresh, 10);
      session.refreshExpiresAt = new Date(Date.now() + REFRESH_TTL_MS);
      session.lastLoginAt = new Date();
      await this.authRepo.save(session);

      return { accessToken: newAccess, refreshToken: newRefresh };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // 로그아웃(해당 디바이스 세션 파기)
  async logout(userId: number, deviceId: string) {
    await this.authRepo.update(
      { userId, deviceId },
      { refreshTokenHash: null, refreshExpiresAt: null },
    );
  }

  // 모든 디바이스 로그아웃(선택)
  async logoutAll(userId: number) {
    await this.authRepo.update(
      { userId },
      { refreshTokenHash: null, refreshExpiresAt: null },
    );
  }
}
