import { IsString, MinLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchBusDto {
  @ApiProperty({
    example: '9507',
    description: '검색할 버스 번호',
  })
  @IsString()
  @MinLength(1, { message: '검색어를 입력해주세요' })
  keyword: string;
}

export class GetBusInfoDto {
  @ApiProperty({
    example: 'DJB30300002',
    description: '버스 노선 ID',
  })
  @IsString()
  routeId: string;

  @ApiProperty({
    example: 31020,
    description: '도시 코드 (예: 31020-성남시, 31010-수원시, 11-서울)',
  })
  @IsNumber()
  @Type(() => Number)
  cityCode: number;
}

export class GetEtaDto {
  @ApiProperty({
    example: 'DJB30300002',
    description: '버스 노선 ID',
  })
  @IsString()
  busId: string;

  @ApiProperty({
    example: 'DJB8001793',
    description: '정류장 ID',
  })
  @IsString()
  stopId: string;
}

export class GetRouteStopsDto {
  @ApiProperty({
    example: 'DJB30300002',
    description: '버스 노선 ID',
  })
  @IsString()
  routeId: string;

  @ApiProperty({
    example: 31020,
    description: '도시 코드 (예: 31020-성남시, 31010-수원시, 11-서울)',
  })
  @IsNumber()
  @Type(() => Number)
  cityCode: number;
}