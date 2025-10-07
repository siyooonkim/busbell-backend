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
  RefreshDto,
  LogoutLocalDto,
  RegisterDto,
  LoginDto,
} from './dtos/auth.dto';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ 1) OTP 발송
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerLocal(dto.email, dto.password);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.loginLocal(dto.email, dto.password);
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
