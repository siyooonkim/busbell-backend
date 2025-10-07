import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  IsOptional,
  IsIn,
  IsEmail,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  @MinLength(8) // 정책 예시
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  password: string;
}

// ✅ 3️⃣ 카카오 로그인 DTO
export class KakaoLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '카카오 액세스 토큰',
  })
  @IsString()
  kakaoAccessToken: string;

  @ApiProperty({
    example: 'device-uuid-xyz',
    description: '디바이스 식별자',
  })
  @IsString()
  deviceId: string;
}

// ✅ 4️⃣ 토큰 재발급 DTO
export class RefreshDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh Token',
  })
  @IsString()
  refreshToken: string;
}

// ✅ 5️⃣ 로그아웃 DTO
export class LogoutLocalDto {
  @ApiProperty({
    example: 'phone',
    description: '로그인 제공자 ("phone" | "kakao")',
    enum: ['phone', 'kakao'],
  })
  @IsIn(['phone', 'kakao'])
  provider: 'phone' | 'kakao';

  @ApiProperty({
    example: '01012345678',
    description: '휴대폰 번호 (phone 로그인 시 필수)',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'device-uuid-xyz',
    description: '디바이스 식별자',
  })
  @IsString()
  deviceId: string;
}
