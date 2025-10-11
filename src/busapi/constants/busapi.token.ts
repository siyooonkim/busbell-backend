//  Nest DI가 런타임에 주입 대상을 식별할 라벨(상수)
// Symbol을 쓰면 유일성이 보장되어 충돌 위험이 없다. (문자열 상수도 가능하긴 함)
export const BUS_API_TOKEN = Symbol('BUS_API_TOKEN');
