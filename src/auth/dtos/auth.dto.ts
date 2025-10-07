// src/auth/dtos/auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'device-uuid-xyz',
    description: '디바이스 식별자(세션 키)',
  })
  @IsString()
  deviceId: string;

  @ApiProperty({ example: 'fcm-token-....', required: false })
  @IsString()
  fcmToken?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'device-uuid-xyz' })
  @IsString()
  deviceId: string;
}

export class RefreshDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh Token',
  })
  @IsString()
  refreshToken: string;
}

// ✅ email-only이므로 provider/phone 필드 제거
export class LogoutDto {
  @ApiProperty({ example: 'device-uuid-xyz' })
  @IsString()
  deviceId: string; // 가드에서 추출 가능하면 바디로 안 받아도 됨
}
