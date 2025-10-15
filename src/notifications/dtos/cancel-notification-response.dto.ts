import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus } from '../enums/notification-status.enum';

export class CancelNotificationResponseDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ enum: NotificationStatus, example: 'canceled' })
  status: NotificationStatus;

  @ApiProperty({ example: '알림이 취소되었습니다' })
  message: string;
}
