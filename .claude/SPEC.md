### 개선 완료 사항
1. ✅ 운행시간 배차 간격 정보 - TAGO API의 `getRouteInfoItem` 엔드포인트로 구현됨
   - `interval`: 배차 간격 (분 단위)
   - `serviceHours`: 운행 시간 (예: "05:30~23:00")
   - cityCode 파라미터 추가하여 모든 지역 지원
2. ✅ 버스 정류소 direction 값 수정
   - 기존: `nodeord` (정류장 순서) 기반으로 잘못 계산 → 모두 1로 조회됨
   - 수정: API 응답의 `updowncd` 필드 사용 (0: 상행, 1: 하행) 