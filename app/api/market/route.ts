import { NextRequest, NextResponse } from 'next/server';
import { MarketData } from '@/lib/types';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const DEFAULT_COINS = ['bitcoin', 'ethereum', 'base', 'usd-coin', 'chainlink'];

interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || DEFAULT_COINS;
    const includeSparkline = searchParams.get('sparkline') === 'true';

    // Build CoinGecko API URL
    const coinIds = symbols.join(',');
    const sparklineParam = includeSparkline ? '&sparkline=true' : '';
    const apiKey = process.env.COINGECKO_API_KEY;
    const apiKeyParam = apiKey ? `&x_cg_demo_api_key=${apiKey}` : '';
    
    const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=50&page=1${sparklineParam}${apiKeyParam}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(apiKey && { 'x-cg-demo-api-key': apiKey }),
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoResponse[] = await response.json();

    // Transform to our MarketData format
    const marketData: MarketData[] = data.map((coin) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      priceChange24h: coin.price_change_24h,
      priceChangePercentage24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      timestamp: new Date(),
      trendIndicator: calculateTrendIndicator(coin.price_change_percentage_24h),
      sparkline: coin.sparkline_in_7d?.price || generateMockSparkline(coin.current_price),
    }));

    return NextResponse.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Market data fetch error:', error);
    
    // Fallback to mock data if API fails
    const mockData = await getMockMarketData();
    
    return NextResponse.json({
      success: false,
      data: mockData,
      error: 'Using fallback data due to API error',
      timestamp: new Date().toISOString(),
    }, { status: 200 }); // Return 200 with fallback data
  }
}

function calculateTrendIndicator(priceChangePercentage: number): 'bullish' | 'bearish' | 'neutral' {
  if (priceChangePercentage > 2) return 'bullish';
  if (priceChangePercentage < -2) return 'bearish';
  return 'neutral';
}

function generateMockSparkline(currentPrice: number): number[] {
  const points = 24; // 24 hours of data
  const sparkline: number[] = [];
  let price = currentPrice * 0.95; // Start 5% lower
  
  for (let i = 0; i < points; i++) {
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    price = price * (1 + variation);
    sparkline.push(price);
  }
  
  // Ensure the last point is close to current price
  sparkline[points - 1] = currentPrice;
  
  return sparkline;
}

async function getMockMarketData(): Promise<MarketData[]> {
  const mockCoins = [
    { symbol: 'BTC', name: 'Bitcoin', price: 43250.50 },
    { symbol: 'ETH', name: 'Ethereum', price: 2650.75 },
    { symbol: 'BASE', name: 'Base', price: 1.85 },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00 },
    { symbol: 'LINK', name: 'Chainlink', price: 14.25 },
  ];

  return mockCoins.map((coin) => {
    const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
    const priceChange24h = coin.price * priceChange;
    
    return {
      symbol: coin.symbol,
      name: coin.name,
      price: coin.price,
      priceChange24h,
      priceChangePercentage24h: priceChange * 100,
      marketCap: coin.price * 1000000, // Mock market cap
      volume24h: coin.price * 500000, // Mock volume
      timestamp: new Date(),
      trendIndicator: calculateTrendIndicator(priceChange * 100),
      sparkline: generateMockSparkline(coin.price),
    };
  });
}
