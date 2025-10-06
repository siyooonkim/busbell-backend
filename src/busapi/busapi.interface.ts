// 외부 api 호출 인터페이스

// 1. 외부 버스 api에게 제공해야하는 데이터
export interface BusApiPort {
  /**
   * 특정 '도시/정류장/노선'에 대한 ETA(분)를 조회한다.
   * @param cityCode  예: 경기도=31 (TAGO 스펙에서 도시코드가 필요)
   * @param stopId    정류장 ID
   * @param routeId   노선(버스) ID
   */

  getArrivalInfo(busId: string, stopId: string): Promise<ArrivalInfo>;
}

// 2. 외부 api가 반환해야할 데이터
export interface ArrivalInfo {
  /** ETA(분): 정류장까지 도착까지 남은 분 */
  etaMinutes: number;

  /** 남은 정류장 수 */
  remainingStopsCount?: number;
}
