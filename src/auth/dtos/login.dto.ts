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

  @ApiPropertyOptional({
    example: 'fcm_token_from_firebase',
    description: 'FCM 푸시 토큰 (선택)',
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
