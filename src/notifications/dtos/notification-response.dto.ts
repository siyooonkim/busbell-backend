import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationType } from '../enums/notification-type.enum';

export class NotificationResponseDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'ROUTE_SN_9507' })
  routeId: string;

  @ApiProperty({ example: '9507' })
  busNumber: string;

  @ApiPropertyOptional({ example: '상행' })
  direction?: string;

  @ApiProperty({ example: 'STOP_004' })
  stopId: string;

  @ApiProperty({ example: '롯데마을1,3단지' })
  stopName: string;

  @ApiProperty({ enum: NotificationType, example: 'time' })
  notificationType: NotificationType;

  @ApiPropertyOptional({ example: 5 })
  minutesBefore?: number;

  @ApiPropertyOptional({ example: 3 })
  stopsBefore?: number;

  @ApiProperty({ enum: NotificationStatus, example: 'reserved' })
  status: NotificationStatus;

  @ApiPropertyOptional({ example: 8 })
  lastEtaMinutes?: number;

  @ApiPropertyOptional({ example: '2025-10-11T10:35:00.000Z' })
  nextPollAt?: Date;

  @ApiProperty({ example: '2025-10-11T12:30:00.000Z' })
  expiresAt: Date;

  @ApiProperty({ example: '2025-10-11T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-11T10:30:00.000Z' })
  updatedAt: Date;
}
