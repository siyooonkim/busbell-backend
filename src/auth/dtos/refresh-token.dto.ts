import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh Token',
  })
  @IsString()
  refreshToken: string;

  @ApiProperty({
    example: 'device-12345',
    description: '디바이스 ID',
  })
  @IsString()
  deviceId: string;
}
