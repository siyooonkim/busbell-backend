import { ApiProperty } from '@nestjs/swagger';

export class BusSearchItemDto {
  @ApiProperty({ example: 'ROUTE_SN_9507' })
  routeId: string;

  @ApiProperty({ example: '9507' })
  busNumber: string;

  @ApiProperty({ example: '성남' })
  regionName: string;

  @ApiProperty({ example: '판교대장로통촉' })
  startStop: string;

  @ApiProperty({ example: '청담초등학교앞' })
  endStop: string;
}

export class BusSearchResponseDto {
  @ApiProperty({ type: [BusSearchItemDto] })
  results: BusSearchItemDto[];
}
