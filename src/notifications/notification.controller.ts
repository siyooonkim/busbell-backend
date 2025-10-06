import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { CreateNotificationDto } from './dtos/create-notifications.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateNotificationDto) {
    // 로그인 붙이기 전이니 임시로 userId=1 가정 (실서비스에선 가드/토큰 사용)
    const userId = 1;
    return this.svc.create(userId, dto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string) {
    return this.svc.cancel(Number(id));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Req() req: any) {
    const userId = 1;
    return this.svc.listMine(userId);
  }
}
