// src/busapi/busapi.controller.ts
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BusApiService } from './busapi.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { GetEtaDto } from './dtos/busapi.dto';

@ApiTags('Bus API')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bus')
export class BusApiController {
  constructor(private readonly busApiService: BusApiService) {}

  // ✅ ETA 조회
  @Get('eta')
  @ApiOperation({ summary: '버스 도착 ETA(분) 조회' })
  @ApiQuery({
    name: 'busId',
    required: true,
    type: String,
    example: '9507',
    description: '버스 ID',
  })
  @ApiQuery({
    name: 'stopId',
    required: true,
    type: String,
    example: 'STOP123',
    description: '정류장 ID',
  })
  @ApiResponse({
    status: 200,
    description: '해당 정류장의 버스 도착 예상 시간(분)을 반환합니다.',
    schema: {
      example: { etaMinutes: 5 },
    },
  })
  async getEtaMinutes(@Query() query: GetEtaDto) {
    const etaMinutes = await this.busApiService.getArrivalInfo(
      query.busId,
      query.stopId,
    );
    return { etaMinutes };
  }
}
