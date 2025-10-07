// src/busapi/providers/tago.adapter.ts
import axios, { AxiosInstance } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import {
  ArrivalInfo,
  BusApiPort,
  LiveData,
  RouteOverview,
} from '../busapi.interface';

/**
 * 🚍 TagoAdapter
 * - 국토교통부 TAGO(OpenAPI)를 호출해 버스 ETA, 노선정보, 위치정보를 가져오는 어댑터
 * - BusApiPort 인터페이스를 구현해서 Nest DI 시스템에 연결됨
 */
@Injectable()
export class TagoAdapter implements BusApiPort {
  private readonly logger = new Logger(TagoAdapter.name);
  private readonly httpClient: AxiosInstance;
  private readonly tagoBaseUrl = 'https://apis.data.go.kr/1613000';
  private readonly serviceKey: string;

  constructor() {
    // .env에 등록된 TAGO 서비스키 사용
    this.serviceKey = process.env.TAGO_SERVICE_KEY || '';
    if (!this.serviceKey) {
      this.logger.warn('⚠️ TAGO_SERVICE_KEY not found in environment');
    }

    this.httpClient = axios.create({
      timeout: 5000,
      params: {
        serviceKey: this.serviceKey,
        _type: 'json',
      },
    });
  }

  /**
   * 🚌 1️⃣ ETA(도착예정시간) 조회
   * - stopId(정류장ID), busId(노선ID)를 받아 도착 예상 시간(분) 반환
   * - TAGO 엔드포인트: BusArrivalService/getBusArrivalList
   */
  async getArrivalInfo(busId: string, stopId: string): Promise<ArrivalInfo> {
    try {
      const url = `${this.tagoBaseUrl}/BusArrivalService/getBusArrivalList`;

      const response = await this.httpClient.get(url, {
        params: {
          cityCode: 25_010, // 지역 코드 (예시: 서울/수원/부산은 다름)
          nodeId: stopId, // 정류장 ID
        },
      });

      const items = Array.isArray(response.data?.response?.body?.items?.item)
        ? response.data.response.body.items.item
        : [response.data?.response?.body?.items?.item].filter(Boolean);

      // 버스ID가 일치하는 항목 찾기
      const matched = items.find(
        (item) => String(item.routeid) === String(busId),
      );

      if (!matched) {
        return { etaMinutes: -1 };
      }

      // API 구조 예시: item.arrtime (초 단위)
      const etaMinutes = Math.ceil(Number(matched.arrtime) / 60);
      const remainingStopsCount = Number(matched.arrprevstationcnt || 0);

      return { etaMinutes };
    } catch (e) {
      this.logger.error(`🚨 TAGO ETA fetch error: ${e.message}`);
      throw e;
    }
  }

  /**
   * 🧾 2️⃣ 노선 기본정보 조회
   * - TAGO 엔드포인트: BusRouteInfoInquireService/getRouteInfoItem
   */
  async getOverview(routeId: string): Promise<RouteOverview> {
    try {
      const url = `${this.tagoBaseUrl}/BusRouteInfoInquireService/getRouteInfoItem`;

      const response = await this.httpClient.get(url, {
        params: { cityCode: 25_010, routeId },
      });

      const item = response.data?.response?.body?.items?.item;
      if (!item) throw new Error('No route info');

      return {
        routeId,
        routeName: item.routeno,
        startStop: item.startnodenm,
        endStop: item.endnodenm,
        interval: Number(item.intervaltime || 0),
        serviceHours: `${item.startvehicletime}~${item.endvehicletime}`,
        isOperating: true,
      };
    } catch (e) {
      this.logger.error(`TAGO overview fetch failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * 🚍 3️⃣ 실시간 위치 조회
   * - TAGO 엔드포인트:
   */
  async getLive(routeId: string): Promise<LiveData> {
    try {
      const url = `${this.tagoBaseUrl}/BusLcInfoInqireService/getRouteAcctoBusLcList`;

      const response = await this.httpClient.get(url, {
        params: { cityCode: 25_010, routeId },
      });

      const items = Array.isArray(response.data?.response?.body?.items?.item)
        ? response.data.response.body.items.item
        : [response.data?.response?.body?.items?.item].filter(Boolean);

      const vehicles = items.map((v) => ({
        vehicleId: v.vehicleno,
        currentStop: v.nodenm,
        nextStop: v.nextnodenm,
        updatedAt: v.updatetime,
      }));

      return { routeId, vehicles };
    } catch (e) {
      this.logger.error(`TAGO live fetch failed: ${e.message}`);
      throw e;
    }
  }
}
