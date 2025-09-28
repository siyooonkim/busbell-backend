import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BusApiService } from './busapi.service';

@Module({
  imports: [HttpModule],
  providers: [BusApiService],
  exports: [BusApiService],
})
export class BusApiModule {}
