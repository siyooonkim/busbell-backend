import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: '요청이 올바르지 않습니다',
    description: '에러 메시지 (단일 또는 배열)',
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
