import { ApiProperty } from '@nestjs/swagger';

export class VehicleInfoDto {
  @ApiProperty({ example: 'VEHICLE_001' })
  vehicleId: string;

  @ApiProperty({ example: '판교풍경채5단지' })
  currentStop: string;

  @ApiProperty({ example: '힐스테이트6단지' })
  nextStop: string;

  @ApiProperty({ example: 3 })
  remainingStops: number;

  @ApiProperty({ example: '2025-10-11T10:30:00.000Z' })
  updatedAt: string;
}

export class LiveDataDto {
  @ApiProperty({ example: 'ROUTE_SN_9507' })
  routeId: string;

  @ApiProperty({ type: [VehicleInfoDto] })
  vehicles: VehicleInfoDto[];
}
