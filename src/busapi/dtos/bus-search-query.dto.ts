import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BusSearchQueryDto {
  @ApiProperty({
    example: '9507',
    description: '검색할 버스 번호',
  })
  @IsString()
  @MinLength(1, { message: '검색어를 입력해주세요' })
  keyword: string;
}
