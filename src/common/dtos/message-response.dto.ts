import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: '작업이 완료되었습니다' })
  message: string;
}
