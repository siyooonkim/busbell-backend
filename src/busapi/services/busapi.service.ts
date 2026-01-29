// Facade: 앱 내부에서 쓸 얇은 래퍼(공통 메서드만 노출)
// 복잡한 하위 시스템 앞에 ‘간단한 출입구 하나’를 세워서, 밖에서는 그 출입구만 쓰게 만드는 패턴
// 포트(인터페이스): “외부 제공자가 지켜야 할 함수 모양” 정의. (예: BusApiPort)
// 어댑터(구현): 실제로 API를 호출해서 그 모양에 맞춰 값을 돌려줌. (예: TagoAdapter, MockAdapter)
// 파사드(서비스): 바깥에서 쓰기 쉽게 얇은 래퍼. 내부 어댑터를 감추고 공통 메서드만 노출. (예: BusApiService)

import { Inject, Injectable } from '@nestjs/common';
import { BUS_API_TOKEN } from '../constants/busapi.token';
import {
  ArrivalInfo,
  BusApiPort,
  LiveData,
  RouteOverview,
  RouteStops,
} from '../interfaces/busapi.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class BusApiService {
  constructor(
    @Inject(BUS_API_TOKEN) private readonly busApi: BusApiPort,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async searchBus(keyword: string) {
    const key = `bus:search:${keyword}`;
    const cached = await this.cache.get(key);
    if (cached) {
      console.log('🟢 [CACHE HIT] bus search');
      return cached;
    }

    console.log('🔵 [CACHE MISS] bus search');
    const data = await this.busApi.searchBus(keyword);
    await this.cache.set(key, data, 60 * 10); // 10분 캐시
    return data;
  }

  async getOverview(routeId: string, cityCode: number): Promise<RouteOverview> {
    const key = `bus:overview:${cityCode}:${routeId}`;
    const cached = await this.cache.get<RouteOverview>(key);

    if (cached) {
      console.log('🟢 [CACHE HIT] overview');
      return cached;
    }

    console.log('🔵 [CACHE MISS] overview');
    const data = await this.busApi.getOverview(routeId, cityCode);
    await this.cache.set(key, data, 60 * 60 * 6); // 6시간
    return data;
  }

  async getRealTimeInfo(routeId: string, cityCode: number): Promise<LiveData> {
    // 캐시 임시 비활성화 (디버깅용)
    console.log('🔵 [NO CACHE] live');
    return this.busApi.getRealTimeInfo(routeId, cityCode);
  }

  async getArrivalInfo(
    routeId: string,
    stopId: string,
    cityCode: number,
  ): Promise<ArrivalInfo> {
    // 캐시 임시 비활성화 (디버깅용)
    console.log('🔵 [NO CACHE] eta');
    return this.busApi.getArrivalInfo(routeId, stopId, cityCode);
  }

  async getRouteStops(routeId: string, cityCode: number): Promise<RouteStops> {
    const key = `bus:route-stops:${routeId}:${cityCode}`;
    const cached = await this.cache.get<RouteStops>(key);

    if (cached) {
      console.log('🟢 [CACHE HIT] route-stops');
      return cached;
    }

    console.log('🔵 [CACHE MISS] route-stops');
    const data = await this.busApi.getRouteStops(routeId, cityCode);
    await this.cache.set(key, data, 60 * 60 * 24); // 24시간 (정류장 목록은 자주 안바뀜)
    return data;
  }
}
