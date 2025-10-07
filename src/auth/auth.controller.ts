import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshDto, RegisterDto, LoginDto, LogoutDto } from './dtos/auth.dto';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ 1) 회원가입 (email/password + deviceId)
  @Post('register')
  @ApiOperation({ summary: '회원가입 (이메일/비밀번호)' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    // 서비스에 deviceId, fcmToken 전달 → auth upsert까지 수행
    return this.authService.registerLocal(
      dto.email,
      dto.password,
      dto.deviceId,
      dto.fcmToken,
    );
  }

  // ✅ 2) 로그인 (email/password + deviceId)
  @Post('login')
  @ApiOperation({ summary: '로그인 (이메일/비밀번호)' })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto) {
    return this.authService.loginLocal(dto.email, dto.password, dto.deviceId);
  }

  // ✅ 3) AccessToken 재발급
  @Post('refresh')
  @ApiOperation({ summary: 'Access/Refresh 재발급' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 201, description: '새 토큰 발급 성공' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  // ✅ 4) 로그아웃 (해당 디바이스 세션 파기)
  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiBearerAuth()
  @ApiBody({ type: LogoutDto })
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Body() dto: LogoutDto) {
    // JwtStrategy에서 payload에 userId, deviceId 넣어두면 req.user에서 꺼낼 수 있음
    const userId: number = req.user.userId;
    const deviceId: string = dto.deviceId || req.user.deviceId;
    await this.authService.logout(userId, deviceId);
    return { message: '로그아웃 완료' };
  }
}
