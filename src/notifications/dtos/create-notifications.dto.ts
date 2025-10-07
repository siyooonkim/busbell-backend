import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: '9507', description: '버스 노선 ID' })
  @IsString()
  @IsNotEmpty()
  busId: string;

  @ApiProperty({ example: '9507', description: '버스 번호' })
  @IsString()
  @IsNotEmpty()
  busNumber: string;

  @ApiProperty({ example: '판교방면', description: '버스 방향' })
  @IsString()
  @IsNotEmpty()
  busDirection: string;

  @ApiProperty({ example: 'STOP1234', description: '정류장 ID' })
  @IsString()
  @IsNotEmpty()
  stopId: string;

  @ApiProperty({ example: '봇들마을.한라비발디', description: '정류장 이름' })
  @IsString()
  @IsNotEmpty()
  stopName: string;

  @ApiProperty({
    example: 'time',
    description: '알림 타입 ("time" | "stops")',
    enum: ['time', 'stops'],
  })
  @IsEnum(['time', 'stops'] as any)
  notificationType: 'time' | 'stops' = 'time';

  @ApiProperty({
    example: 5,
    description: '도착 전 알림 받을 분 (notificationType=time)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minutesBefore?: number;

  @ApiProperty({
    example: 2,
    description: '남은 정류장 수 기준 알림 (notificationType=stops)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stopsBefore?: number;
}
