# Exchange Rate Module

## What it does
Provides the official BCV (Banco Central de Venezuela) dollar exchange rate for dynamic currency conversion on the storefront.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/exchange-rate/dolar-bcv` | None | Get current BCV rate |

## How it works

### External API integration
The service fetches the official dollar rate from `https://ve.dolarapi.com/v1/dolares/oficial`:

```typescript
async getDolarBCV() {
  const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
  const data = await response.json();
  return { rate: parseFloat(data.promedio), source: 'api' };
}
```

### Caching
To avoid rate-limiting and improve response times, the service caches the rate for 24 hours:

```typescript
private cache: { rate: number; timestamp: number } | null = null;
private readonly cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
```

On error, if a cached value exists, it's returned as a fallback:

```typescript
async getDolarBCV() {
  if (this.cache && Date.now() - this.cache.timestamp < this.cacheDuration) {
    return { rate: this.cache.rate, source: 'cache' };
  }
  try {
    // fetch from API
  } catch {
    if (this.cache) return { rate: this.cache.rate, source: 'cache' };
    return { rate: null, source: 'error' };
  }
}
```

## Why this design
- **In-memory caching**: Simpler than Redis — the 24-hour cache duration means at most one API call per server instance per day.
- **Graceful degradation**: If the external API is down, the cached rate is returned with a `source: 'cache'` indicator so the frontend can display it with a warning.
- **No auth required**: The exchange rate is public — anyone visiting the store should be able to see prices in their preferred currency.
