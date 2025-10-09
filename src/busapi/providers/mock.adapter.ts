// src/busapi/providers/mock.adapter.ts
import {
  BusApiPort,
  RouteOverview,
  LiveData,
  ArrivalInfo,
  BusSearchResult,
} from '../busapi.interface';

export class MockAdapter implements BusApiPort {
  async searchBus(keyword: string): Promise<BusSearchResult[]> {
    return [
      {
        routeId: '1',
        busNumber: '9507',
        regionName: '성남',
        startStop: '판교대장로',
        endStop: '청담초등학교',
      },
      {
        routeId: '2',
        busNumber: '9507',
        regionName: '서울',
        startStop: '서울오교',
        endStop: '두리초등학교',
      },
      {
        routeId: '3',
        busNumber: '9507',
        regionName: '인천',
        startStop: '송도센트럴파크',
        endStop: '연수구청',
      },
    ];
  }

  async getOverview(routeId: string): Promise<RouteOverview> {
    return {
      routeId,
      routeName: '9507',
      startStop: '판교대장로통촉',
      endStop: '청담초등학교앞',
      interval: 25,
      serviceHours: '04:40 ~ 23:40',
      isOperating: true,
    };
  }

  async getLive(routeId: string): Promise<LiveData> {
    return {
      routeId,
      vehicles: [
        {
          vehicleId: 'VEHICLE_001',
          currentStop: '판교풍경채5단지',
          nextStop: '힐스테이트6단지',
          updatedAt: new Date().toISOString(),
        },
        {
          vehicleId: 'VEHICLE_002',
          currentStop: '힐스테이트6단지',
          nextStop: '청담초등학교앞',
          updatedAt: new Date().toISOString(),
        },
      ],
    };
  }

  async getArrivalInfo(busId: string, stopId: string): Promise<ArrivalInfo> {
    // ETA: 1~10분 랜덤
    return {
      etaMinutes: Math.floor(Math.random() * 10) + 1,
    };
  }
}
