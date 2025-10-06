// src/auth/dto.ts
import { IsString, Length, IsOptional } from 'class-validator';

export class PhoneRequestDto {
  @IsString()
  phone: string;

  @IsString()
  deviceId: string;
}

export class PhoneVerifyDto {
  @IsString()
  phone: string;

  @Length(6, 6)
  code: string;

  @IsString()
  deviceId: string;
}

export class KakaoLoginDto {
  @IsString()
  kakaoAccessToken: string;

  @IsString()
  deviceId: string;
}

export class RefreshDto {
  @IsString()
  refreshToken: string;

  @IsString()
  deviceId: string;
}

export class LogoutLocalDto {
  @IsString()
  provider: 'phone' | 'kakao';

  @IsString()
  phone: string;

  @IsString()
  deviceId: string;
}
