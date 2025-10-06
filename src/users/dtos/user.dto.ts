import { IsOptional, IsString } from 'class-validator';

export class UpdateFcmDto {
  @IsString()
  fcmToken: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
