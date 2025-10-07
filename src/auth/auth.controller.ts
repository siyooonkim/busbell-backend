// src/auth/auth.controller.ts
import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  PhoneRequestDto,
  PhoneVerifyDto,
  RefreshDto,
  LogoutLocalDto,
} from './dtos/auth.dto';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ 1) OTP 발송
  @Post('otp/send')
  @ApiOperation({ summary: '휴대폰 OTP 발송' })
  @ApiBody({ type: PhoneRequestDto })
  @ApiResponse({ status: 201, description: 'OTP 발송 성공' })
  async sendOtp(@Body() dto: PhoneRequestDto) {
    return this.authService.sendOtp(dto.phone);
  }

  // ✅ 2) OTP 인증 및 로그인/회원가입
  @Post('otp/verify')
  @ApiOperation({ summary: 'OTP 인증 및 회원 생성' })
  @ApiBody({ type: PhoneVerifyDto })
  @ApiResponse({ status: 201, description: '인증 성공 및 토큰 발급' })
  async verifyOtp(@Body() dto: PhoneVerifyDto) {
    return this.authService.verifyOtp(dto.phone, dto.code, dto.deviceId);
  }

  // ✅ 3) AccessToken 재발급
  @Post('refresh')
  @ApiOperation({ summary: 'AccessToken 재발급' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 201, description: '새 토큰 발급 성공' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  // ✅ 4) 로그아웃
  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiBearerAuth()
  @ApiBody({ type: LogoutLocalDto })
  @ApiResponse({ status: 200, description: '로그아웃 완료' })
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    const { userId, deviceId } = req.user;
    await this.authService.logout(userId, deviceId);
    return { message: '로그아웃 완료' };
  }
}
