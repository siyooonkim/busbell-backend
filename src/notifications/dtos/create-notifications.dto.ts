import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  busId: string;

  @IsString()
  @IsNotEmpty()
  busNumber: string;

  @IsString()
  @IsNotEmpty()
  busDirection: string;

  @IsString()
  @IsNotEmpty()
  stopId: string;

  @IsString()
  @IsNotEmpty()
  stopName: string;

  @IsEnum(['time', 'stops'] as any) notificationType: 'time' | 'stops' = 'time';

  @IsOptional()
  @IsInt()
  @Min(0)
  minutesBefore?: number; // time 모드

  @IsOptional()
  @IsInt()
  @Min(0)
  stopsBefore?: number; // stops 모드
}
