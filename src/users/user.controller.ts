// src/users/user.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth() // 🔐 모든 엔드포인트 JWT 필요
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  // ✅ 내 정보 조회
  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ status: 200, description: '유저 정보 반환' })
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }

  // ✅ FCM 토큰 업데이트
  @Patch('fcm-token')
  @ApiOperation({ summary: 'FCM 토큰 업데이트' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fcmToken: { type: 'string', example: 'abcdef123456' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '토큰 업데이트 완료' })
  async updateFcm(@Req() req, @Body('fcmToken') fcmToken: string) {
    return this.usersService.updateFcmToken(req.user.userId, fcmToken);
  }

  // ✅ 회원 탈퇴
  @Delete()
  @ApiOperation({ summary: '회원 탈퇴 (Soft Delete)' })
  @ApiResponse({ status: 200, description: '탈퇴 완료' })
  async deleteUser(@Req() req) {
    return this.usersService.softDelete(req.user.userId);
  }
}
