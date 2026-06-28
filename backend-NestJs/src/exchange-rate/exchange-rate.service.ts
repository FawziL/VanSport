import { Injectable } from '@nestjs/common';

@Injectable()
export class ExchangeRateService {
  private cache: { rate: number; fecha: string; timestamp: number } | null = null;
  private readonly cacheDuration = 24 * 60 * 60 * 1000;

  async getDolarBCV() {
    if (this.cache && Date.now() - this.cache.timestamp < this.cacheDuration) {
      return { valor: this.cache.rate, fecha: this.cache.fecha, desactualizado: false };
    }

    try {
      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      const data = await response.json();
      const rate = parseFloat(data.promedio);
      const fecha = data.fecha || new Date().toISOString();

      this.cache = { rate, fecha, timestamp: Date.now() };
      return { valor: rate, fecha, desactualizado: false };
    } catch {
      if (this.cache) {
        return { valor: this.cache.rate, fecha: this.cache.fecha, desactualizado: true };
      }
      return { valor: null, fecha: null, desactualizado: false };
    }
  }
}
