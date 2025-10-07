// Module: "토큰→구현체" 바인딩과 BusApiService를 DI에 등록

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BusApiService } from './busapi.service';
import { BUS_API_TOKEN } from './busapi.token';
import { TagoAdapter } from './providers/tago.adapter';
import { BusApiController } from './busapi.controller';

@Module({
  imports: [HttpModule],
  controllers: [BusApiController],
  providers: [
    BusApiService,
    {
      provide: BUS_API_TOKEN,
      useClass: TagoAdapter,
    },
  ],
  exports: [BusApiService],
})
export class BusApiModule {}
