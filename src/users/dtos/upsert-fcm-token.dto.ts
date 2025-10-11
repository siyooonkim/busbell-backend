import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertFcmTokenDto {
  @ApiProperty({
    example: 'fcm_token_string_from_firebase...',
    description: 'FCM Push Token',
  })
  @IsString()
  fcmToken: string;
}

export class UpsertFcmTokenResponseDto {
  @ApiProperty({ example: 'FCM 토큰이 업데이트되었습니다' })
  message: string;

  @ApiProperty({ example: 'fcm_token_string_from_firebase...' })
  fcmToken: string;
}
