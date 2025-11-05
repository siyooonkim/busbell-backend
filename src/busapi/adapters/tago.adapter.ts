// src/busapi/providers/tago.adapter.ts
import axios, { AxiosInstance } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import {
  ArrivalInfo,
  BusApiPort,
  BusSearchResult,
  LiveData,
  RouteOverview,
} from '../interfaces/busapi.interface';

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
   * ⭐️ 여기부터 api테스트부터, 이제[ 어떤 api 의 정보가 피요한지 어떤 순서대로 할지 정해야함
   * 그러기위해 앱 사용 시나리오에 따라서 정해야할듯
   * 버스 번호 검색
   * - TAGO: BusRouteInfoInquireService/getRouteNoList
   * - keyword로 버스번호 검색 시 지역별 노선 리스트 반환
   */
  async searchBus(keyword: string): Promise<BusSearchResult[]> {
    try {
      const url = `${this.tagoBaseUrl}/BusRouteInfoInqireService/getRouteNoList`;

      // 현재 버전은 예시로 주요 도시만 순회
      const cityList = [
        { name: '수원시', code: 31010 },
        { name: '성남시', code: 31020 },
        { name: '의정부시', code: 31030 },
        { name: '안양시', code: 31040 },
        { name: '부천시', code: 31050 },
        { name: '서울', code: 11 },
        { name: '인천', code: 23 },
      ];

      const results: BusSearchResult[] = [];

      for (const city of cityList) {
        const res = await this.httpClient.get(url, {
          params: {
            cityCode: city.code,
            routeNo: keyword,
          },
        });

        // 디버깅: API 응답 로그
        this.logger.debug(`[${city.name}] Response:`, JSON.stringify(res.data, null, 2));

        const items = Array.isArray(res.data?.response?.body?.items?.item)
          ? res.data.response.body.items.item
          : [res.data?.response?.body?.items?.item].filter(Boolean);

        this.logger.debug(`[${city.name}] Found ${items.length} items`);

        for (const item of items) {
          results.push({
            routeId: item.routeid,
            busNumber: item.routeno,
            regionName: city.name,
            startStop: item.startnodenm,
            endStop: item.endnodenm,
          });
        }
      }

      return results;
    } catch (e) {
      this.logger.error(`TAGO searchBus failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * ETA(도착예정시간) 조회
   * - stopId(정류장ID), busId(노선ID)를 받아 도착 예상 시간(분) 반환
   * - TAGO 엔드포인트: ArvlInfoInqireService/getSttnAcctoSpcifyRouteBusArvlPrearngeInfoList
   */
  async getArrivalInfo(routeId: string, nodeId: string): Promise<ArrivalInfo> {
    try {
      const url = `${this.tagoBaseUrl}/ArvlInfoInqireService/getSttnAcctoSpcifyRouteBusArvlPrearngeInfoList`;

      const response = await this.httpClient.get(url, {
        params: {
          cityCode: 31000, // 도시코드 (31000: 경기)
          nodeId, // 정류장 ID
          routeId, // 노선 ID
        },
      });

      const items = Array.isArray(response.data?.response?.body?.items?.item)
        ? response.data.response.body.items.item
        : [response.data?.response?.body?.items?.item].filter(Boolean);

      if (!items || items.length === 0) {
        return { etaMinutes: -1 };
      }

      // 첫 번째 도착 예정 버스 정보 사용
      const item = items[0];

      // arrprevstationcnt: 남은 정류장 수
      // arrtime: 도착 예정 시간 (초)
      const etaMinutes = item.arrtime
        ? Math.ceil(Number(item.arrtime) / 60)
        : -1;

      return { etaMinutes };
    } catch (e) {
      this.logger.error(`🚨 TAGO ETA fetch error: ${e.message}`);
      throw e;
    }
  }

  /**
   * 노선 기본정보 조회
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
   * 실시간 위치 조회
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
