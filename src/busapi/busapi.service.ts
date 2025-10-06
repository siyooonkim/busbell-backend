// Facade: 앱 내부에서 쓸 얇은 래퍼(공통 메서드만 노출)
// 복잡한 하위 시스템 앞에 ‘간단한 출입구 하나’를 세워서, 밖에서는 그 출입구만 쓰게 만드는 패턴
// 포트(인터페이스): “외부 제공자가 지켜야 할 함수 모양” 정의. (예: BusApiPort)
// 어댑터(구현): 실제로 API를 호출해서 그 모양에 맞춰 값을 돌려줌. (예: TagoAdapter, MockAdapter)
// 파사드(서비스): 바깥에서 쓰기 쉽게 얇은 래퍼. 내부 어댑터를 감추고 공통 메서드만 노출. (예: BusApiService)

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
