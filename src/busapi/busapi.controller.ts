// src/busapi/busapi.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BusApiService } from './busapi.service';
import { GetEtaDto, GetBusInfoDto } from './dtos/busapi.dto';

@ApiTags('Bus API')
@Controller('bus')
export class BusApiController {
  constructor(private readonly busApiService: BusApiService) {}

  // ✅ 1️⃣ 노선 개요 조회
  @Get('overview')
  @ApiOperation({ summary: '버스 노선 개요 조회' })
  @ApiResponse({
    status: 200,
    description: '노선의 시작-종료 정류장, 배차 간격, 운행 여부를 반환',
  })
  async getOverview(@Query() dto: GetBusInfoDto) {
    return this.busApiService.getOverview(dto.routeId);
  }

  // ✅ 2️⃣ 실시간 차량 위치 조회
  @Get('live')
  @ApiOperation({ summary: '실시간 차량 위치 조회' })
  @ApiResponse({
    status: 200,
    description: '현재 차량 위치 및 다음 정류장 정보 반환',
  })
  async getLive(@Query() dto: GetBusInfoDto) {
    return this.busApiService.getLive(dto.routeId);
  }

  // ✅ 3️⃣ ETA(도착 예정 시간) 조회
  @Get('eta')
  @ApiOperation({ summary: '특정 정류장 도착 ETA 조회' })
  @ApiResponse({
    status: 200,
    description: '해당 정류장 기준 버스 도착 예상 시간(분)',
  })
  async getEta(@Query() dto: GetEtaDto) {
    return this.busApiService.getArrivalInfo(dto.busId, dto.stopId);
  }
}
