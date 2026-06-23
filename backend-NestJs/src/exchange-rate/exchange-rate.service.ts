import { Injectable } from '@nestjs/common';

@Injectable()
export class ExchangeRateService {
  private cache: { rate: number; timestamp: number } | null = null;
  private readonly cacheDuration = 24 * 60 * 60 * 1000;

  async getDolarBCV() {
    if (this.cache && Date.now() - this.cache.timestamp < this.cacheDuration) {
      return { rate: this.cache.rate, source: 'cache' };
    }

    try {
      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      const data = await response.json();
      const rate = parseFloat(data.promedio);

      this.cache = { rate, timestamp: Date.now() };
      return { rate, source: 'api' };
    } catch {
      if (this.cache) {
        return { rate: this.cache.rate, source: 'cache' };
      }
      return { rate: null, source: 'error' };
    }
  }
}
