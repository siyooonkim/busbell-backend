import { IsString, Length, IsOptional, IsIn } from 'class-validator';

// ✅ 1) OTP 요청용
export class PhoneRequestDto {
  @IsString()
  phone: string;

  @IsString()
  deviceId: string;
}

// ✅ 2) OTP 인증용
export class PhoneVerifyDto {
  @IsString()
  phone: string;

  @Length(6, 6)
  code: string; // 6자리 인증번호

  @IsString()
  deviceId: string;
}

// ✅ 3) 카카오 로그인용
export class KakaoLoginDto {
  @IsString()
  kakaoAccessToken: string;

  @IsString()
  deviceId: string;
}

// ✅ 4) 토큰 재발급용 (Refresh)
export class RefreshDto {
  @IsString()
  refreshToken: string;

  @IsString()
  deviceId: string;
}

// ✅ 5) 로그아웃용
export class LogoutLocalDto {
  @IsIn(['phone', 'kakao'])
  provider: 'phone' | 'kakao';

  @IsString()
  phone: string;

  @IsString()
  deviceId: string;
}
