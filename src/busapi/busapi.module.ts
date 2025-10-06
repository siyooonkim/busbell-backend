// Module: "토큰→구현체" 바인딩과 BusApiService를 DI에 등록

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BusApiService } from './busapi.service';

@Module({
  imports: [HttpModule],
  providers: [BusApiService],
  exports: [BusApiService],
})
export class BusApiModule {}
