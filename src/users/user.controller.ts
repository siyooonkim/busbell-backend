import {
  Controller,
  Get,
  Patch,
  Delete,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserService } from './user.service';
import { UpdateFcmDto } from './dtos/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly usersService: UserService) {}

  // ✅ 내 정보 조회
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }

  // ✅ FCM 토큰 업데이트
  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard)
  async updateFcm(@Req() req, dto: UpdateFcmDto) {
    return this.usersService.updateFcmToken(req.user.userId, dto.fcmToken);
  }

  // ✅ 회원 탈퇴
  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req) {
    return this.usersService.softDelete(req.user.userId);
  }
}
