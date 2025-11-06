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
  routeName: string; // routenm
  vehicles: Array<{
    vehicleNo: string; // vehicleno (차량번호)
    nodeId: string; // nodeid (현재 정류소ID)
    nodeName: string; // nodenm (현재 정류소명)
    nodeOrder: number; // nodeord (정류소 순서)
    latitude: number; // gpslati
    longitude: number; // gpslong
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

export interface BusStop {
  stopId: string; // nodeid
  stopName: string; // nodenm
  stopNumber: string; // nodeno
  sequence: number; // nodeord (정류소순번)
  latitude: number; // gpslati
  longitude: number; // gpslong
  direction: 0 | 1; // updowncd (0:상행, 1:하행)
}

export interface RouteStops {
  routeId: string;
  stops: BusStop[];
}

export interface BusApiPort {
  searchBus(keyword: string): Promise<BusSearchResult[]>;
  getOverview(routeId: string): Promise<RouteOverview>;
  getRealTimeInfo(routeId: string, cityCode: number): Promise<LiveData>;
  getArrivalInfo(busId: string, stopId: string): Promise<ArrivalInfo>;
  getRouteStops(routeId: string, cityCode: number): Promise<RouteStops>;
}
