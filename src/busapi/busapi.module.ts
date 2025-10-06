// Module: "토큰→구현체" 바인딩과 BusApiService를 DI에 등록

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BusApiService } from './busapi.service';
import { BUS_API_TOKEN } from './busapi.token';
import { TagoAdapter } from './providers/tago.adapter';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [
    BusApiService,
    {
      provide: BUS_API_TOKEN,
      useFactory: (config: ConfigService) => {
        const key = config.get<string>(BUS_API_TOKEN);
        if (!key) throw new Error('TAGO_SERVICE_KEY 가 .env에 없습니다.');
        return new TagoAdapter(key);
      },
    },
  ],
  exports: [BusApiService],
})
export class BusApiModule {}
