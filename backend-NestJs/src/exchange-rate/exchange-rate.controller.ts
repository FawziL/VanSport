import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExchangeRateService } from './exchange-rate.service';

@ApiTags('Exchange Rate')
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('dolar-bcv')
  @ApiOperation({ summary: 'Get BCV dollar exchange rate' })
  getDolarBCV() {
    return this.exchangeRateService.getDolarBCV();
  }
}
