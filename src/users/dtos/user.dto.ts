import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFcmDto {
  @ApiProperty({
    example: 'fcm_token_abc123',
    description: 'Firebase Cloud Messaging 토큰',
  })
  @IsString()
  fcmToken: string;

  @ApiProperty({
    example: 'device-uuid-xyz',
    description: '디바이스 식별자 (선택)',
    required: false,
  })
  @IsString()
  @IsOptional()
  deviceId?: string;
}
