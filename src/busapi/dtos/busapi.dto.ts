import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetEtaDto {
  @ApiProperty({
    example: '9507',
    description: '버스 노선 ID',
  })
  @IsString()
  busId: string;

  @ApiProperty({
    example: 'STOP1234',
    description: '정류장 ID',
  })
  @IsString()
  stopId: string;
}

export class GetBusInfoDto {
  @ApiProperty({ example: 'ROUTE_G_9507' })
  @IsString()
  routeId: string;
}
