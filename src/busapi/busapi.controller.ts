// src/busapi/busapi.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { BusApiService } from './busapi.service';

@ApiTags('Bus API')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bus')
export class BusApiController {
  constructor(private readonly busApiService: BusApiService) {}

  @Get('overview')
  @ApiOperation({ summary: '노선 기본정보 조회 (6시간 캐시)' })
  overview(@Query('routeId') routeId: string) {
    return this.busApiService.getOverview(routeId);
  }

  @Get('live')
  @ApiOperation({ summary: '실시간 위치 (10초 캐시)' })
  live(@Query('routeId') routeId: string) {
    return this.busApiService.getLive(routeId);
  }

  @Get('eta')
  @ApiOperation({ summary: 'ETA (단건, 캐시 없음)' })
  eta(@Query('busId') busId: string, @Query('stopId') stopId: string) {
    return this.busApiService.getArrivalInfo(busId, stopId);
  }
}
