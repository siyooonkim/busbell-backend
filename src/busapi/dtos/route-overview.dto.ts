import { ApiProperty } from '@nestjs/swagger';

export class BusStopDto {
  @ApiProperty({ example: 'STOP_001' })
  stopId: string;

  @ApiProperty({ example: '판교대장로통촉' })
  stopName: string;

  @ApiProperty({ example: 1 })
  sequence: number;
}

export class RouteOverviewDto {
  @ApiProperty({ example: 'ROUTE_SN_9507' })
  routeId: string;

  @ApiProperty({ example: '9507' })
  routeName: string;

  @ApiProperty({ example: '판교대장로통촉' })
  startStop: string;

  @ApiProperty({ example: '청담초등학교앞' })
  endStop: string;

  @ApiProperty({ example: 25, description: '배차 간격 (분)' })
  interval: number;

  @ApiProperty({ example: '04:40 ~ 23:40' })
  serviceHours: string;

  @ApiProperty({ example: true })
  isOperating: boolean;

  @ApiProperty({ type: [BusStopDto] })
  stops: BusStopDto[];
}
