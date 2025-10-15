import {
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  ValidateIf,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'ROUTE_SN_9507',
    description: '노선 ID',
  })
  @IsString()
  routeId: string;

  @ApiProperty({
    example: '9507',
    description: '버스 번호',
  })
  @IsString()
  busNumber: string;

  @ApiPropertyOptional({
    example: '상행',
    description: '방향 (상행/하행)',
  })
  @IsOptional()
  @IsString()
  direction?: string;

  @ApiProperty({
    example: 'STOP_004',
    description: '정류장 ID',
  })
  @IsString()
  stopId: string;

  @ApiProperty({
    example: '롯데마을1,3단지',
    description: '정류장 이름',
  })
  @IsString()
  stopName: string;

  @ApiProperty({
    enum: NotificationType,
    example: 'time',
    description: '알림 타입 (time: 시간 기반, stops: 정류장 기반)',
  })
  @IsEnum(NotificationType, {
    message: 'notificationType은 time 또는 stops 중 하나여야 합니다',
  })
  notificationType: NotificationType;

  @ApiPropertyOptional({
    example: 5,
    description: '몇 분 전 알림 (1-30분, time 모드일 때 필수)',
  })
  @ValidateIf((o) => o.notificationType === NotificationType.Time)
  @IsInt({ message: 'minutesBefore는 정수여야 합니다' })
  @Min(1, { message: 'minutesBefore는 최소 1분입니다' })
  @Max(30, { message: 'minutesBefore는 최대 30분입니다' })
  minutesBefore?: number;

  @ApiPropertyOptional({
    example: 3,
    description: '몇 정류장 전 알림 (1-10개, stops 모드일 때 필수)',
  })
  @ValidateIf((o) => o.notificationType === NotificationType.Stops)
  @IsInt({ message: 'stopsBefore는 정수여야 합니다' })
  @Min(1, { message: 'stopsBefore는 최소 1개입니다' })
  @Max(10, { message: 'stopsBefore는 최대 10개입니다' })
  stopsBefore?: number;
}
