// Facade: 앱 내부에서 쓸 얇은 래퍼(공통 메서드만 노출)
// 복잡한 하위 시스템 앞에 ‘간단한 출입구 하나’를 세워서, 밖에서는 그 출입구만 쓰게 만드는 패턴
// 포트(인터페이스): “외부 제공자가 지켜야 할 함수 모양” 정의. (예: BusApiPort)
// 어댑터(구현): 실제로 API를 호출해서 그 모양에 맞춰 값을 돌려줌. (예: TagoAdapter, MockAdapter)
// 파사드(서비스): 바깥에서 쓰기 쉽게 얇은 래퍼. 내부 어댑터를 감추고 공통 메서드만 노출. (예: BusApiService)

import { Inject, Injectable } from '@nestjs/common';
import { BUS_API_TOKEN } from './busapi.token';
import {
  ArrivalInfo,
  BusApiPort,
  LiveData,
  RouteOverview,
} from './busapi.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class BusApiService {
  constructor(
    @Inject(BUS_API_TOKEN) private readonly busApi: BusApiPort,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async getOverview(routeId: string): Promise<RouteOverview> {
    const key = `bus:overview:${routeId}`;
    const cached = await this.cache.get<RouteOverview>(key);

    if (cached) {
      console.log('🟢 [CACHE HIT] overview');
      return cached;
    }

    console.log('🔵 [CACHE MISS] overview');
    const data = await this.busApi.getOverview(routeId);
    await this.cache.set(key, data, 60 * 60 * 6); // 6시간
    return data;
  }

  async getLive(routeId: string): Promise<LiveData> {
    const key = `bus:live:${routeId}`;
    const cached = await this.cache.get<LiveData>(key);

    if (cached) {
      console.log('🟢 [CACHE HIT] live');
      return cached;
    }

    console.log('🔵 [CACHE MISS] live');
    const data = await this.busApi.getLive(routeId);
    await this.cache.set(key, data, 10); // 10초
    return data;
  }

  // ETA(분)만 리턴. 실제 API 붙일 때 여기만 고치면 나머지는 그대로 작동.
  async getArrivalInfo(busId: string, stopId: string): Promise<ArrivalInfo> {
    // TODO: 공공버스 API 호출 + 파싱
    // 타임아웃/재시도도 여기서 처리
    return this.busApi.getArrivalInfo(busId, stopId);
  }
}
