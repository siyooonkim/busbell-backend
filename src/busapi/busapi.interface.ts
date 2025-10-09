export interface RouteOverview {
  routeId: string;
  routeName: string;
  startStop: string;
  endStop: string;
  interval: number; // 배차 간격
  serviceHours: string;
  isOperating: boolean;
}

export interface LiveData {
  routeId: string;
  vehicles: Array<{
    vehicleId: string;
    currentStop: string;
    nextStop: string;
    updatedAt: string;
  }>;
}

export interface ArrivalInfo {
  etaMinutes: number;
}
export interface BusSearchResult {
  routeId: string;
  busNumber: string;
  regionName: string;
  startStop: string;
  endStop: string;
}

export interface BusApiPort {
  searchBus(keyword: string): Promise<BusSearchResult[]>;
  getOverview(routeId: string): Promise<RouteOverview>;
  getLive(routeId: string): Promise<LiveData>;
  getArrivalInfo(busId: string, stopId: string): Promise<ArrivalInfo>;
}
