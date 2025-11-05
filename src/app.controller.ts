import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Get('health')
  @ApiOperation({ summary: '서버 헬스체크' })
  getHealth() {
    return this.appService.getHealthStatus();
  }
}
