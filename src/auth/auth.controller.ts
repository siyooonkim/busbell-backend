import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import {
  PhoneRequestDto,
  PhoneVerifyDto,
  RefreshDto,
  LogoutLocalDto,
} from './dtos/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ OTP 전송 (휴대폰 인증번호 요청)
  @ApiOperation({ summary: '휴대폰 인증번호 전송' })
  @Post('otp/send')
  sendOtp(@Body() dto: PhoneRequestDto) {
    return this.authService.sendOtp(dto.phone);
  }

  // ✅ OTP 검증 (6자리 인증번호 확인)
  @ApiOperation({ summary: '휴대폰 인증번호 검증' })
  @Post('otp/verify')
  verifyOtp(@Body() dto: PhoneVerifyDto) {
    return this.authService.verifyOtp(dto.phone, dto.code, dto.deviceId);
  }

  // ✅ 회원가입 or 로그인 (phone + deviceId + fcmToken)
  @ApiOperation({ summary: '휴대폰 로그인 또는 회원가입' })
  @Post('register')
  register(
    @Body()
    body: {
      phone: string;
      deviceId: string;
      fcmToken: string;
    },
  ) {
    return this.authService.register(body.phone, body.deviceId, body.fcmToken);
  }

  // ✅ 토큰 재발급
  @ApiOperation({ summary: 'AccessToken 재발급' })
  @Post('refresh')
  refresh(@Body() dto: RefreshDto, @Req() req) {
    // userId는 access 만료 시점이라 헤더에 없을 수도 있음
    return this.authService.refreshTokens(dto.deviceId, dto.refreshToken);
  }

  // ✅ 로그아웃
  @ApiOperation({ summary: '로그아웃 (RefreshToken 삭제)' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Body() dto: LogoutLocalDto) {
    const { userId, deviceId } = req.user;
    await this.authService.logout(userId, deviceId);
    return { message: '로그아웃 완료' };
  }
}
