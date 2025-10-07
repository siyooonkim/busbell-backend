import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional, IsIn } from 'class-validator';

// ✅ 1️⃣ OTP 요청 DTO
export class PhoneRequestDto {
  @ApiProperty({
    example: '01012345678',
    description: '사용자 휴대폰 번호',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'device-uuid-xyz',
    description: '디바이스 식별자 (React Native 단말 UUID)',
  })
  @IsString()
  deviceId: string;
}

// ✅ 2️⃣ OTP 인증 DTO
export class PhoneVerifyDto {
  @ApiProperty({
    example: '01012345678',
    description: '사용자 휴대폰 번호',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: '123456',
    description: '6자리 OTP 코드',
  })
  @Length(6, 6)
  code: string;

  @ApiProperty({
    example: 'device-uuid-xyz',
    description: '디바이스 식별자 (React Native 단말 UUID)',
  })
  @IsString()
  deviceId: string;
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
