// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Auth } from './auth.entity';
import { AuthOtp } from './auth_otp.entity';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
    @InjectRepository(AuthOtp) private readonly otpRepo: Repository<AuthOtp>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(phone: string, deviceId: string, fcmToken: string) {
    let auth = await this.authRepo.findOne({ where: { phone, deviceId } });
    let user: User;

    if (!auth) {
      user = await this.userRepo.save(this.userRepo.create({ fcmToken }));
      auth = this.authRepo.create({
        userId: user.id,
        phone,
        provider: 'phone',
        deviceId,
      });
    } else {
      user = await this.userRepo.findOne({ where: { id: auth.userId } });
    }

    // 3️⃣ 토큰 발급
    const payload = { sub: user.id, deviceId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    auth.refreshTokenHash = refreshTokenHash;
    auth.refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authRepo.save(auth);

    return { user, accessToken, refreshToken };
  }

  // ✅ OTP 발급
  async sendOtp(phone: string) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 3 * 60 * 1000); // 3분 후 만료

    await this.otpRepo.save({ phone, code, expiresAt: expires });
    // 실제 서비스에선 여기서 SMS API 호출(Firebase, Twilio 등)

    return { success: true, code }; // 테스트용으로 code 리턴
  }

  // ✅ OTP 인증 & 회원 생성 or 로그인
  async verifyOtp(phone: string, code: string, deviceId: string) {
    const otp = await this.otpRepo.findOne({ where: { phone, code } });
    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired or invalid');
    }

    // 기존 유저 확인 or 새로 생성
    let user = await this.userRepo.findOne({ where: { fcmToken: deviceId } });
    if (!user)
      user = await this.userRepo.save(
        this.userRepo.create({ fcmToken: deviceId }),
      );

    // Auth row upsert
    let auth = await this.authRepo.findOne({ where: { phone, deviceId } });
    if (!auth) {
      auth = await this.authRepo.save(
        this.authRepo.create({
          userId: user.id,
          phone,
          provider: 'phone',
          deviceId,
        }),
      );
    }

    // Refresh Token 발급 및 저장
    const payload = { sub: user.id, deviceId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    auth.refreshTokenHash = refreshTokenHash;
    auth.refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authRepo.save(auth);

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
