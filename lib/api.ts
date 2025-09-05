import { MarketData, TrendSignal, UserAlert, AlertFormData, User } from './types';
import { MOCK_MARKET_DATA, generateSparklineData, calculateTrendIndicator } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Market Data API
export async function fetchMarketData(symbols?: string[]): Promise<MarketData[]> {
  try {
    const symbolsParam = symbols ? `?symbols=${symbols.join(',')}&sparkline=true` : '?sparkline=true';
    const response = await fetch(`${API_BASE_URL}/api/market${symbolsParam}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      // Fallback to mock data if API fails
      console.warn('Market API failed, using fallback data:', result.error);
      return result.data || getMockMarketData();
    }
  } catch (error) {
    console.error('Market data fetch error:', error);
    return getMockMarketData();
  }
}

function getMockMarketData(): MarketData[] {
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

// Authentication API
export async function authenticateUser(walletAddress: string, telegramId?: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress, telegramId }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Authentication failed');
  }

  return result.data;
}

export async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth?userId=${userId}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch user');
  }

  return result.data;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, updates }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to update user');
  }

  return result.data;
}

// Alerts API
export async function fetchUserAlerts(userId: string): Promise<UserAlert[]> {
  const response = await fetch(`${API_BASE_URL}/api/alerts?userId=${userId}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch alerts');
  }

  return result.data;
}

export async function createAlert(userId: string, alertData: AlertFormData): Promise<UserAlert> {
  const response = await fetch(`${API_BASE_URL}/api/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, alertData }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to create alert');
  }

  return result.data;
}

export async function deleteAlert(userId: string, alertId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/alerts?userId=${userId}&alertId=${alertId}`, {
    method: 'DELETE',
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete alert');
  }
}

// Notifications API
export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  channels: ('browser' | 'telegram')[],
  telegramChatId?: string,
  alertId?: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        message,
        channels,
        telegramChatId,
        alertId,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Notification send error:', error);
    return false;
  }
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

export async function testTelegramSetup(): Promise<{ success: boolean; bot?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications?test=telegram`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Failed to test Telegram setup',
    };
  }
}
