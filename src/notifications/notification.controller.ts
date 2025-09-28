import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { CreateNotificationDto } from './dtos/create-notifications.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  // 로그인 붙이기 전이니 임시로 userId=1 가정 (실서비스에선 가드/토큰 사용)
  @Post()
  create(@Body() dto: CreateNotificationDto, @Req() req: any) {
    const userId = 1;
    return this.svc.create(userId, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.svc.cancel(Number(id));
  }

  @Get()
  list(@Req() req: any) {
    const userId = 1;
    return this.svc.listMine(userId);
  }
}
