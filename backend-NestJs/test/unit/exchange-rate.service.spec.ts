import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExchangeRateService } from '../../src/exchange-rate/exchange-rate.service';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;

  beforeEach(() => {
    service = new ExchangeRateService();
  });

  it('should return cached rate on API failure', async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ promedio: 50.25 }),
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await service.getDolarBCV();
    expect(result.rate).toBe(50.25);
    expect(result.source).toBe('api');
  });

  it('should return cached rate on second call', async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ promedio: 50.25 }),
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    await service.getDolarBCV();
    const result = await service.getDolarBCV();
    expect(result.source).toBe('cache');
  });

  it('should handle API error gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await service.getDolarBCV();
    expect(result.rate).toBeNull();
    expect(result.source).toBe('error');
  });
});
