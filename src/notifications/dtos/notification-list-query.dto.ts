import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationStatus } from '../enums/notification-status.enum';

export class NotificationListQueryDto {
  @ApiPropertyOptional({
    enum: NotificationStatus,
    description: '알림 상태 필터',
  })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;
}
