import { MarketData, TrendSignal } from './types';
import { SUPPORTED_CRYPTOCURRENCIES, API_ENDPOINTS } from './constants';
import { calculateTrendSignal, generateMockPriceHistory } from './utils';

// Mock data for development - replace with real API calls in production
export async function fetchMarketData(): Promise<MarketData[]> {
  try {
    // In production, use real CoinGecko API
    // const response = await fetch(`${API_ENDPOINTS.COINGECKO_MARKETS}?vs_currency=usd&order=market_cap_desc&per_page=10&page=1`);
    // const data = await response.json();
    
    // Mock data for development
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
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
}

export async function fetchCryptoPrice(symbol: string): Promise<number | null> {
  try {
    // In production, use real CoinGecko API
    // const response = await fetch(`${API_ENDPOINTS.COINGECKO_PRICE}?ids=${symbol}&vs_currencies=usd`);
    // const data = await response.json();
    // return data[symbol]?.usd || null;
    
    // Mock data for development
    const mockPrices: Record<string, number> = {
      bitcoin: 67500,
      ethereum: 3850,
      solana: 185,
      cardano: 0.65,
      binancecoin: 425,
    };
    
    return mockPrices[symbol] || null;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return null;
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
