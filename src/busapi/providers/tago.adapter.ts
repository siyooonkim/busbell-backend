// Adapter(구현체)
// TAGO API를 호출해서 인터페이스 모양으로 값 반환하는 구현체
// 버스 노선 정보 + 정류장 정보 를 이용해 현재 정류장에 원하는 버스가 오기까지 얼마나 걸리는지를 구하는 구현체 함수

import axios, { AxiosInstance } from 'axios';
import { ArrivalInfo, BusApiPort } from '../busapi.interface';

export class TagoAdapter implements BusApiPort {
  private readonly httpClient: AxiosInstance;
  private readonly tagoBaseUrl = 'http://apis.data.go.kr/1613000';

  constructor(private readonly tagoServiceKey: string) {
    this.httpClient = axios.create({
      timeout: 5000,
      params: {
        serviceKey: this.tagoServiceKey,
        _type: 'json',
      },
    });
  }

  /**
   * '도시/정류장/노선'에 대한 ETA(분) 조회
   * TODO: 실제 TAGO 엔드포인트/필드명은 문서 기준으로 정확히 맞춰야 한다.
   */
  async getArrivalInfo(stopId: string, busId: string): Promise<ArrivalInfo> {
    // 1) TAGO 오퍼레이션 URL (예시: 정류장별 도착 예정 리스트)
    const url = `${this.tagoBaseUrl}`;

    // 2) HTTP 요청: 정류장ID를 전달
    const response = await this.httpClient.get(url, {
      params: {
        stopId,
      },
    });

    // 3) 응답 파싱
    const raw = response.data;
    const items: any[] = raw?.response?.body?.items?.item
      ? Array.isArray(raw.response.body.items.item)
        ? raw.response.body.items.item
        : [raw.response.body.items.item]
      : [];

    // 4) 해당 busId에 해당하는 항목들만 필터링
    const matched = items.filter(
      (item) => String(item.busId) === String(busId),
    );

    // 확인 필요
    const etaMinutes = Math.min(matched[0].minutes);
    const remainingStopsCount = Math.min(matched[0].stops);

    return { etaMinutes, remainingStopsCount };
  }
}
