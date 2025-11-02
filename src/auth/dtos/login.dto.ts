import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '이메일',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: '비밀번호',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'DEVICE_UUID_12345',
    description: '기기 고유 ID',
  })
  @IsString()
  deviceId: string;

  @ApiPropertyOptional({
    example: 'fcm_token_from_firebase',
    description: 'FCM 푸시 토큰',
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
