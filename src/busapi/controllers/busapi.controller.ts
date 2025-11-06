// src/busapi/busapi.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BusApiService } from '../services/busapi.service';
import {
  GetEtaDto,
  GetBusInfoDto,
  SearchBusDto,
  GetRouteStopsDto,
} from '../dtos/busapi.dto';

@ApiTags('Bus API')
@Controller('bus')
export class BusApiController {
  constructor(private readonly busApiService: BusApiService) {}

  // ✅ 버스번호 검색
  @Get('search')
  @ApiOperation({ summary: '버스 번호 검색 (지역별 노선 리스트 조회)' })
  @ApiResponse({
    status: 200,
    description: '입력된 버스번호에 해당하는 지역별 노선 목록 반환',
  })
  async searchBus(@Query() dto: SearchBusDto) {
    return this.busApiService.searchBus(dto.keyword);
  }

  // ✅ 노선 개요 조회
  @Get('overview')
  @ApiOperation({ summary: '버스 노선 개요 조회' })
  @ApiResponse({
    status: 200,
    description: '노선의 시작-종료 정류장, 배차 간격, 운행 여부를 반환',
  })
  async getOverview(@Query() dto: GetBusInfoDto) {
    return this.busApiService.getOverview(dto.routeId);
  }

  // ✅ 실시간 차량 위치 조회
  @Get('realtime-info')
  @ApiOperation({ summary: '실시간 차량 위치 조회' })
  @ApiResponse({
    status: 200,
    description: '운행 중인 모든 버스의 실시간 위치 정보 반환',
  })
  async getRealTimeInfo(@Query() dto: GetBusInfoDto) {
    return this.busApiService.getRealTimeInfo(dto.routeId, dto.cityCode);
  }

  // ✅ ETA(도착 예정 시간) 조회
  @Get('eta')
  @ApiOperation({ summary: '특정 정류장 도착 ETA 조회' })
  @ApiResponse({
    status: 200,
    description: '해당 정류장에 도착 예정인 모든 버스의 정보 반환',
  })
  async getEta(@Query() dto: GetEtaDto) {
    return this.busApiService.getArrivalInfo(
      dto.routeId,
      dto.stopId,
      dto.cityCode,
    );
  }

  // ✅ 노선별 정류장 목록 조회
  @Get('route-stops')
  @ApiOperation({ summary: '노선별 정류장 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '해당 노선이 경유하는 모든 정류장 목록 (순서, 좌표 포함)',
  })
  async getRouteStops(@Query() dto: GetRouteStopsDto) {
    return this.busApiService.getRouteStops(dto.routeId, dto.cityCode);
  }
}
