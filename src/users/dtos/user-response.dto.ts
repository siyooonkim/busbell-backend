import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '김버스' })
  nickname: string;

  @ApiProperty({ example: 'fcm_token_string...', nullable: true })
  fcmToken: string | null;

  @ApiProperty({ example: '2025-10-11T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-11T10:30:00.000Z' })
  updatedAt: Date;
}
