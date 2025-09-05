import { MarketData, TrendSignal } from './types';
import { SUPPORTED_CRYPTOCURRENCIES, API_ENDPOINTS } from './constants';
import { calculateTrendSignal, generateMockPriceHistory } from './utils';

// Helper function to determine trend indicator based on price change
function getTrendIndicator(priceChangePercentage: number): 'bullish' | 'bearish' | 'neutral' {
  if (priceChangePercentage > 2) return 'bullish';
  if (priceChangePercentage < -2) return 'bearish';
  return 'neutral';
}

// Fetch real market data from CoinGecko API
export async function fetchMarketData(): Promise<MarketData[]> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.COINGECKO_MARKETS}?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const marketData: MarketData[] = data.map((coin: any) => ({
      symbol: coin.id,
      name: coin.name,
      price: coin.current_price,
      priceChange24h: coin.price_change_24h || 0,
      priceChangePercentage24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap || 0,
      volume24h: coin.total_volume || 0,
      timestamp: new Date(),
      trendIndicator: getTrendIndicator(coin.price_change_percentage_24h || 0),
      image: coin.image,
    }));
    
    return marketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    
    // Fallback to mock data if API fails
    const mockData: MarketData[] = [
      {
        symbol: 'bitcoin',
        name: 'Bitcoin',
        price: 67500,
        priceChange24h: 1250,
        priceChangePercentage24h: 1.89,
        marketCap: 1330000000000,
        volume24h: 28500000000,
        timestamp: new Date(),
        trendIndicator: 'bullish',
        image: '🟠',
      },
      {
        symbol: 'ethereum',
        name: 'Ethereum',
        price: 3850,
        priceChange24h: -45,
        priceChangePercentage24h: -1.15,
        marketCap: 463000000000,
        volume24h: 15200000000,
        timestamp: new Date(),
        trendIndicator: 'bearish',
        image: '🔷',
      },
      {
        symbol: 'solana',
        name: 'Solana',
        price: 185,
        priceChange24h: 8.5,
        priceChangePercentage24h: 4.82,
        marketCap: 85000000000,
        volume24h: 3200000000,
        timestamp: new Date(),
        trendIndicator: 'bullish',
        image: '🟣',
      },
    ];
    
    return mockData;
  }
}

export async function fetchCryptoPrice(symbol: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.COINGECKO_PRICE}?ids=${symbol}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data[symbol]?.usd || null;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    
    // Fallback to mock data if API fails
    const mockPrices: Record<string, number> = {
      bitcoin: 67500,
      ethereum: 3850,
      solana: 185,
      cardano: 0.65,
      binancecoin: 425,
    };
    
    return mockPrices[symbol] || null;
  }
}

export async function fetchTrendSignals(): Promise<TrendSignal[]> {
  try {
    // Mock trend signals for development
    const signals: TrendSignal[] = [
      {
        symbol: 'bitcoin',
        signal: 'bullish',
        confidence: 0.85,
        reason: 'Strong buying pressure and breaking resistance at $65,000',
        timestamp: new Date(),
        targetPrice: 75000,
      },
      {
        symbol: 'ethereum',
        signal: 'bearish',
        confidence: 0.72,
        reason: 'Declining volume and approaching support at $3,800',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        targetPrice: 3600,
      },
    ];
    
    return signals;
  } catch (error) {
    console.error('Error fetching trend signals:', error);
    return [];
  }
}

export async function sendTelegramNotification(
  telegramId: string,
  message: string
): Promise<boolean> {
  try {
    // In production, implement Telegram Bot API integration
    console.log(`Sending Telegram notification to ${telegramId}: ${message}`);
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

export async function validateTelegramId(telegramId: string): Promise<boolean> {
  try {
    // In production, validate Telegram ID with Bot API
    return telegramId.length > 0 && /^\d+$/.test(telegramId);
  } catch (error) {
    console.error('Error validating Telegram ID:', error);
    return false;
  }
}
