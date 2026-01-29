// src/busapi/providers/tago.adapter.ts
import axios, { AxiosInstance } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import {
  ArrivalInfo,
  BusApiPort,
  BusSearchResult,
  CityInfo,
  LiveData,
  RouteOverview,
  RouteStops,
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
  private readonly serviceKey: string;
  private readonly tagoBaseUrl: string;

  // 주요 도시 목록 (static)
  // Note: 서울(11)은 TAGO에서 미지원이나 호환성 유지를 위해 보존
  private readonly MAJOR_CITIES: CityInfo[] = [
    { cityCode: 11, cityName: '서울' },
    { cityCode: 31010, cityName: '수원시' },
    { cityCode: 31020, cityName: '성남시' },
    { cityCode: 31100, cityName: '고양시' },
    { cityCode: 31190, cityName: '용인시' },
    { cityCode: 31050, cityName: '부천시' },
    { cityCode: 31060, cityName: '안산시' },
    { cityCode: 31080, cityName: '안양시' },
    { cityCode: 31090, cityName: '남양주시' },
    { cityCode: 31110, cityName: '의정부시' },
  ];

  constructor() {
    // .env에 등록된 TAGO 서비스키 사용
    this.serviceKey = process.env.TAGO_SERVICE_KEY || '';
    this.tagoBaseUrl = process.env.TAGO_BASE_URL || '';
    if (!this.serviceKey) {
      this.logger.warn('TAGO_SERVICE_KEY not found in environment');
    }
    if (!this.tagoBaseUrl) {
      this.logger.warn(
        'TAGO_BASE_URL not found in environment',
        this.tagoBaseUrl,
      );
    }

    this.httpClient = axios.create({
      timeout: 15000, // 5초 → 15초로 증가
      params: {
        serviceKey: this.serviceKey,
        _type: 'json',
      },
    });
  }

  /**
   * 버스 번호 검색
   * - TAGO: BusRouteInfoInquireService/getRouteNoList
   * - keyword로 버스번호 검색 시 지역별 노선 리스트 반환
   */
  async searchBus(keyword: string): Promise<BusSearchResult[]> {
    try {
      const url = `${this.tagoBaseUrl}/BusRouteInfoInqireService/getRouteNoList`;

      this.logger.log(
        `Searching bus '${keyword}' across ${this.MAJOR_CITIES.length} cities`,
      );

      const results: BusSearchResult[] = [];

      for (const city of this.MAJOR_CITIES) {
        const res = await this.httpClient.get(url, {
          params: {
            cityCode: city.cityCode,
            routeNo: keyword,
          },
        });

        // 디버깅: API 응답 로그
        this.logger.debug(
          `[${city.cityName}] Response:`,
          JSON.stringify(res.data, null, 2),
        );

        const items = Array.isArray(res.data?.response?.body?.items?.item)
          ? res.data.response.body.items.item
          : [res.data?.response?.body?.items?.item].filter(Boolean);

        this.logger.debug(`[${city.cityName}] Found ${items.length} items`);



        for (const item of items) {
          console.log(item)
          results.push({
            routeId: item.routeid,
            busNumber: item.routeno,
            regionName: city.cityName,
            cityCode: city.cityCode,
            startStop: item.startnodenm,
            endStop: item.endnodenm,
          });
        }
      }

      this.logger.log(`Total ${results.length} routes found for '${keyword}'`);
      return results;
    } catch (e) {
      this.logger.error(`TAGO searchBus failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * ETA(도착예정시간) 조회
   * - stopId(정류장ID), routeId(노선ID)를 받아 도착 예상 시간 반환
   * - TAGO 엔드포인트: ArvlInfoInqireService/getSttnAcctoSpcifyRouteBusArvlPrearngeInfoList
   */
  async getArrivalInfo(
    routeId: string,
    nodeId: string,
    cityCode: number,
  ): Promise<ArrivalInfo> {
    try {
      const url = `${this.tagoBaseUrl}/ArvlInfoInqireService/getSttnAcctoSpcifyRouteBusArvlPrearngeInfoList`;

      const response = await this.httpClient.get(url, {
        params: {
          cityCode,
          nodeId, // 정류장 ID
          routeId, // 노선 ID
          numOfRows: 10, // 최대 10대까지
          pageNo: 1,
        },
      });

      const items = Array.isArray(response.data?.response?.body?.items?.item)
        ? response.data.response.body.items.item
        : [response.data?.response?.body?.items?.item].filter(Boolean);

      if (!items || items.length === 0) {
        this.logger.warn(
          `No arrival info for routeId=${routeId}, nodeId=${nodeId}`,
        );
        return {
          routeId,
          routeName: '',
          arrivals: [],
        };
      }

      // 첫 번째 아이템에서 노선명 추출
      const routeName = items[0]?.routeno || '';

      const arrivals = items.map((item) => ({
        vehicleNo: item.vehicleno || '',
        remainingStops: Number(item.arrprevstationcnt || 0),
        remainingSeats: Number(item.reststopseat || 0),
        etaSeconds: Number(item.arrtime || 0),
        etaMinutes: item.arrtime ? Math.ceil(Number(item.arrtime) / 60) : 0,
      }));

      this.logger.log(
        `Found ${arrivals.length} arrivals for routeId=${routeId}, nodeId=${nodeId}`,
      );

      return { routeId, routeName, arrivals };
    } catch (e) {
      this.logger.error(`🚨 TAGO ETA fetch error: ${e.message}`);
      throw e;
    }
  }

  /**
   * 노선 기본정보 조회
   * - TAGO 엔드포인트: BusRouteInfoInquireService/getRouteInfoItem
   */
  async getOverview(routeId: string, cityCode: number): Promise<RouteOverview> {
    try {
      const url = `${this.tagoBaseUrl}/BusRouteInfoInquireService/getRouteInfoItem`;

      const response = await this.httpClient.get(url, {
        params: { cityCode, routeId },
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
   * - TAGO 엔드포인트: BusLcInfoInqireService/getRouteAcctoBusLcList
   * - 특정 노선의 운행 중인 모든 버스의 실시간 위치 정보 반환
   */
  async getRealTimeInfo(routeId: string, cityCode: number): Promise<LiveData> {
    try {
      const url = `${this.tagoBaseUrl}/BusLcInfoInqireService/getRouteAcctoBusLcList`;

      const response = await this.httpClient.get(url, {
        params: {
          cityCode,
          routeId,
          numOfRows: 100, // 운행 중인 버스 최대 100대
          pageNo: 1,
        },
      });

      const items = Array.isArray(response.data?.response?.body?.items?.item)
        ? response.data.response.body.items.item
        : [response.data?.response?.body?.items?.item].filter(Boolean);

      if (!items || items.length === 0) {
        this.logger.warn(`No live data found for routeId: ${routeId}`);
        return {
          routeId,
          routeName: '',
          vehicles: [],
        };
      }

      // 첫 번째 아이템에서 노선명 추출
      const routeName = items[0]?.routenm || '';

      const vehicles = items.map((v) => ({
        vehicleNo: v.vehicleno,
        nodeId: v.nodeid,
        nodeName: v.nodenm,
        nodeOrder: Number(v.nodeord),
        latitude: Number(v.gpslati),
        longitude: Number(v.gpslong),
      }));

      this.logger.log(
        `Found ${vehicles.length} vehicles for routeId: ${routeId}`,
      );

      return { routeId, routeName, vehicles };
    } catch (e) {
      this.logger.error(`TAGO live fetch failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * 노선별 정류장 목록 조회
   * - TAGO 엔드포인트: BusRouteInfoInqireService/getRouteAcctoThrghSttnList
   * - 특정 노선이 경유하는 모든 정류장 정보 반환 (순서, 좌표 포함)
   */
  async getRouteStops(routeId: string, cityCode: number): Promise<RouteStops> {
    try {
      const url = `${this.tagoBaseUrl}/BusRouteInfoInqireService/getRouteAcctoThrghSttnList`;

      const response = await this.httpClient.get(url, {
        params: {
          cityCode,
          routeId,
          numOfRows: 999, // 최대 999개까지 한 번에 요청
          pageNo: 1,
        },
      });

      this.logger.debug(
        `[getRouteStops] API Response: ${JSON.stringify(response.data, null, 2)}`,
      );

      const items = Array.isArray(response.data?.response?.body?.items?.item)
        ? response.data.response.body.items.item
        : [response.data?.response?.body?.items?.item].filter(Boolean);

      if (!items || items.length === 0) {
        this.logger.warn(`No stops found for routeId: ${routeId}`);
        return { routeId, stops: [] };
      }

      this.logger.log(`Found ${items.length} stops for routeId: ${routeId}`);

      // API 응답 필드 확인용 로그 (첫 번째 아이템만)
      if (items.length > 0) {
        this.logger.debug(
          `[getRouteStops] 첫 번째 정류장 데이터: ${JSON.stringify(items[0], null, 2)}`,
        );
      }

      const stops = items.map((item) => ({
        stopId: item.nodeid,
        stopName: item.nodenm,
        stopNumber: item.nodeno,
        sequence: Number(item.nodeord),
        latitude: Number(item.gpslati),
        longitude: Number(item.gpslong),
        // updowncd 필드가 있으면 사용, 없으면 0 (상행) 기본값
        // updowncd: "0" = 상행, "1" = 하행
        direction: item.updowncd !== undefined
          ? (Number(item.updowncd) as 0 | 1)
          : 0,
      }));

      return { routeId, stops };
    } catch (e) {
      this.logger.error(`TAGO getRouteStops failed: ${e.message}`);
      throw e;
    }
  }
}
