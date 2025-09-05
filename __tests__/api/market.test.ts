import { NextRequest } from 'next/server';
import { GET } from '@/app/api/market/route';

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/market', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return market data successfully', async () => {
    // Mock CoinGecko API response
    const mockCoinGeckoData = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 43250.50,
        price_change_24h: 1250.30,
        price_change_percentage_24h: 2.98,
        market_cap: 850000000000,
        total_volume: 25000000000,
        sparkline_in_7d: {
          price: [42000, 42500, 43000, 43250.50]
        }
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCoinGeckoData,
    });

    const request = new NextRequest('http://localhost:3000/api/market?sparkline=true');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].symbol).toBe('BTC');
    expect(data.data[0].price).toBe(43250.50);
    expect(data.data[0].trendIndicator).toBe('bullish');
  });

  it('should return fallback data when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const request = new NextRequest('http://localhost:3000/api/market');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.error).toContain('fallback data');
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should handle custom symbols parameter', async () => {
    const mockData = [
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 2650.75,
        price_change_24h: -50.25,
        price_change_percentage_24h: -1.85,
        market_cap: 320000000000,
        total_volume: 15000000000,
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest('http://localhost:3000/api/market?symbols=ethereum');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data[0].symbol).toBe('ETH');
    expect(data.data[0].trendIndicator).toBe('neutral');
  });
});
