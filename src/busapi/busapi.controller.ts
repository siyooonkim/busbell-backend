import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { BusApiService } from './busapi.service';

@Controller('bus')
export class BusApiController {
  constructor(private readonly busApiService: BusApiService) {}

  @Get('eta')
  async getEtaMinutes(
    @Query('busId') busId: string,
    @Query('stopId') stopId: string,
  ) {
    if (!busId || !stopId) {
      throw new BadRequestException('cityCode stopId는 필수입니다.');
    }
    const etaMinutes = await this.busApiService.getArrivalInfo(busId, stopId);
    return { etaMinutes };
  }
}
