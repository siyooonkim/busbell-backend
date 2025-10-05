import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BusApiService {
  constructor(private readonly http: HttpService) {}

  // ETA(분)만 리턴. 실제 API 붙일 때 여기만 고치면 나머지는 그대로 작동.
  async getEtaMinutes(busId: string, stopId: string): Promise<number> {
    // TODO: 공공버스 API 호출 + 파싱
    // 타임아웃/재시도도 여기서 처리
    return 12; // placeholder
  }

  async getRemainingStops(busId: string, stopId: string): Promise<number> {
    return 3; // 예: 3정류장 남음
  }
}
