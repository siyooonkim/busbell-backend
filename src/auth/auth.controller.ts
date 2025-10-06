import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 기존 OTP 관련 라우트
  @Post('otp/send')
  sendOtp(@Body('phone') phone: string) {
    return this.authService.sendOtp(phone);
  }

  @Post('otp/verify')
  verifyOtp(@Body() body: { phone: string; code: string; deviceId: string }) {
    return this.authService.verifyOtp(body.phone, body.code, body.deviceId);
  }

  @Post('register')
  register(
    @Body() body: { phone: string; deviceId: string; fcmToken: string },
  ) {
    return this.authService.register(body.phone, body.deviceId, body.fcmToken);
  }

  @Post('refresh')
  refresh(@Body() body: { userId: number; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}
