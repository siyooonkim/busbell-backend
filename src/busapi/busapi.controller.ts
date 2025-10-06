import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { BusApiService } from './busapi.service';

@Controller('bus')
export class BusApiController {
  constructor(private readonly busApi: BusApiService) {}

  @Get('eta')
  async get(@Query('busId') busId?: string, @Query('stopId') stopId?: string) {
    if (!busId || !stopId) {
      throw new BadRequestException('busId와 stopId는 필수입니다.');
    }
    const etaMinutes = await this.busApi.getEtaMinutes(busId, stopId);
    return { busId, stopId, etaMinutes };
  }
}
