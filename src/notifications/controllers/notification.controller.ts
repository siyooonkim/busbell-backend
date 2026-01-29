// src/notifications/notifications.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
import { NotificationsService } from '../services/notification.service';
import { CreateNotificationDto } from '../dtos/create-notifications.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Notifications')
@ApiBearerAuth() // JWT 필요
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: '버스 도착 알림 예약 생성' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: '알림이 예약되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (minutesBefore는 1-20분 범위)',
  })
  @ApiResponse({
    status: 409,
    description: '이미 예약된 알림이 있습니다.',
  })
  async createNotification(
    @CurrentUser() user: User,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationService.createNotification(user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '예약된 버스 알림 취소' })
  @ApiParam({ name: 'id', example: 1, description: '알림 ID' })
  @ApiResponse({ status: 200, description: '알림이 취소되었습니다.' })
  @ApiResponse({ status: 404, description: '알림을 찾을 수 없습니다.' })
  async cancelNotification(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.notificationService.cancelNotification(Number(id), user.id);
  }

  @Get()
  @ApiOperation({ summary: '내 예약된 알림 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '내 예약된 알림 리스트 반환',
  })
  async findAllNotifications(@CurrentUser() user: User) {
    return this.notificationService.findAllNotifications(user.id);
  }
}
