import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API 루트 경로' })
  getRoot() {
    return {
      message: '🚌 BusBell API is running',
      docs: '/docs',
      version: '0.1.0',
    };
  }

  @Get('health')
  @ApiOperation({ summary: '서버 헬스체크' })
  getHealth() {
    return this.appService.getHealthStatus();
  }
}
