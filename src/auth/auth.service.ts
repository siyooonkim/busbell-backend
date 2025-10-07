// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Auth } from './auth.entity';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입 (email/password)
  async registerLocal(
    email: string,
    password: string,
    deviceId?: string,
    fcmToken?: string,
  ) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('이미 사용중인 이메일입니다.');

    const hash = await bcrypt.hash(password, 12); // saltRounds = 12 권장
    const user = this.userRepo.create({
      email,
      passwordHash: hash,
      fcmToken,
      isEmailVerified: false,
    });
    const saved = await this.userRepo.save(user);

    // 필요하면 Auth 테이블에 provider='local'로 등록 (deviceId 기반)
    if (deviceId) {
      await this.authRepo.save({
        userId: saved.id,
        provider: 'phone', // 혹은 'local'로 명시(기존 enum 확장 필요)
        phone: '', // 비어둘 수 있음
        deviceId,
      });
    }

    // 토큰 바로 발급할지 여부는 정책(이메일 미검증이면 제한 가능)
    const payload = { userId: saved.id, deviceId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    // 해시해서 Auth 또는 별도 저장소에 보관(이전 구조를 따름)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    // 업서트 auth row 등 처리...

    return {
      user: { id: saved.id, email: saved.email },
      accessToken,
      refreshToken,
    };
  }

  // 로그인
  async loginLocal(email: string, password: string, deviceId?: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');

    // 발급 로직은 기존과 동일
    const payload = { userId: user.id, deviceId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // refreshToken 해시 저장 (Auth 테이블 또는 별도 sessions 테이블)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    // authRepo.save/update...

    return { accessToken, refreshToken };
  }

  // ✅ Refresh 토큰 재발급
  async refreshTokens(refreshToken: string) {
    try {
      // 🔹 JWT 복호화해서 payload 추출
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'busbell-secret',
      });

      const { userId, deviceId } = payload;
      const auth = await this.authRepo.findOne({ where: { userId, deviceId } });
      if (!auth || !auth.refreshTokenHash) throw new UnauthorizedException();

      const isValid = await bcrypt.compare(refreshToken, auth.refreshTokenHash);
      if (!isValid) throw new UnauthorizedException('Invalid refresh token');

      // 🔹 새 Access / Refresh 발급
      const newPayload = { userId, deviceId };
      const newAccess = this.jwtService.sign(newPayload, { expiresIn: '1h' });
      const newRefresh = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      auth.refreshTokenHash = await bcrypt.hash(newRefresh, 10);
      auth.refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.authRepo.save(auth);

      return { accessToken: newAccess, refreshToken: newRefresh };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ✅ 로그아웃
  async logout(userId: number, deviceId: string) {
    await this.authRepo.update(
      { userId, deviceId },
      { refreshTokenHash: null, refreshExpiresAt: null },
    );
  }
}
