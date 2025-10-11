import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    example: 'DEVICE_UUID_12345',
    description: '기기 고유 ID',
  })
  @IsString()
  deviceId: string;
}
