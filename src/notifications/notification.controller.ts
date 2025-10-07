// src/notifications/notifications.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notification.service';
import { CreateNotificationDto } from './dtos/create-notifications.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@ApiTags('Notifications')
@ApiBearerAuth() // JWT 필요
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  // ✅ 알림 등록
  @Post()
  @ApiOperation({ summary: '버스 도착 알림 예약 생성' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: '알림이 예약되었습니다.',
  })
  async create(@Req() req, @Body() dto: CreateNotificationDto) {
    const userId = req.user?.userId; // JWT 연결 전 fallback
    return this.svc.create(userId, dto);
  }

  // ✅ 알림 취소
  @Post(':id/cancel')
  @ApiOperation({ summary: '예약된 버스 알림 취소' })
  @ApiParam({ name: 'id', example: 123, description: '알림 ID' })
  @ApiResponse({ status: 200, description: '알림이 취소되었습니다.' })
  async cancel(@Param('id') id: string) {
    return this.svc.cancel(Number(id));
  }

  // ✅ 내 알림 목록 조회
  @Get()
  @ApiOperation({ summary: '내 예약된 알림 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '내 예약된 알림 리스트 반환',
  })
  async list(@Req() req: any) {
    const userId = req.user?.userId || 1;
    return this.svc.listMine(userId);
  }
}
