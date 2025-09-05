import { MarketData, TrendSignal } from './types';
import { MOCK_MARKET_DATA, generateSparklineData, calculateTrendIndicator } from './utils';

// Mock API functions for demo purposes
// In production, these would connect to real APIs

export async function fetchMarketData(symbols: string[]): Promise<MarketData[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return MOCK_MARKET_DATA.map(coin => ({
    ...coin,
    timestamp: new Date(),
    sparkline: generateSparklineData(coin.price),
  }));
}

export async function fetchCoinPrice(symbol: string): Promise<number> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const coin = MOCK_MARKET_DATA.find(c => c.symbol === symbol);
  if (!coin) throw new Error(`Price not found for ${symbol}`);
  
  // Add some random variation
  const variation = (Math.random() - 0.5) * 0.1;
  return coin.price * (1 + variation);
}

export async function fetchTrendSignals(symbols: string[]): Promise<TrendSignal[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return symbols.map(symbol => {
    const coin = MOCK_MARKET_DATA.find(c => c.symbol === symbol);
    const sparkline = generateSparklineData(coin?.price || 1000);
    const trend = calculateTrendIndicator(sparkline);
    
    return {
      symbol,
      signal: trend,
      confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
      reason: getTrendReason(trend),
      timestamp: new Date(),
      targetPrice: coin ? coin.price * (trend === 'bullish' ? 1.1 : 0.9) : undefined,
    };
  });
}

function getTrendReason(trend: 'bullish' | 'bearish' | 'neutral'): string {
  const reasons = {
    bullish: [
      'Strong buying pressure detected',
      'Breaking above resistance level',
      'Positive momentum indicators',
      'Volume surge with price increase',
    ],
    bearish: [
      'Selling pressure increasing',
      'Breaking below support level',
      'Negative momentum indicators',
      'Volume surge with price decrease',
    ],
    neutral: [
      'Consolidating in range',
      'Mixed signals from indicators',
      'Low volatility period',
      'Waiting for direction',
    ],
  };
  
  const trendReasons = reasons[trend];
  return trendReasons[Math.floor(Math.random() * trendReasons.length)];
}

export async function sendTelegramNotification(
  chatId: string,
  message: string
): Promise<boolean> {
  // Mock implementation
  console.log(`Telegram notification to ${chatId}: ${message}`);
  return true;
}

export async function sendBrowserNotification(
  title: string,
  message: string,
  icon?: string
): Promise<boolean> {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: icon || '/favicon.ico',
      });
      return true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: icon || '/favicon.ico',
        });
        return true;
      }
    }
  }
  return false;
}
