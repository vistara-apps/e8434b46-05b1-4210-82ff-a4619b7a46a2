export interface User {
  userId: string;
  telegramId?: string;
  notificationPreferences: {
    browser: boolean;
    telegram: boolean;
  };
  alertSlots: number;
  subscription?: {
    type: 'free' | 'premium';
    expiresAt?: Date;
  };
}

export interface UserAlert {
  alertId: string;
  userId: string;
  cryptoSymbol: string;
  alertType: 'price_target' | 'trend';
  thresholdValue: number;
  status: 'active' | 'triggered' | 'inactive';
  createdAt: Date;
  triggeredAt?: Date;
  direction?: 'above' | 'below';
  metadata?: {
    currentPrice?: number;
    percentageChange?: number;
  };
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  timestamp: Date;
  trendIndicator?: 'bullish' | 'bearish' | 'neutral';
  sparkline?: number[];
}

export interface TrendSignal {
  symbol: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reason: string;
  timestamp: Date;
  targetPrice?: number;
}

export interface NotificationChannel {
  type: 'browser' | 'telegram';
  enabled: boolean;
  config?: {
    telegramChatId?: string;
  };
}

export interface AlertFormData {
  cryptoSymbol: string;
  alertType: 'price_target' | 'trend';
  thresholdValue: number;
  direction: 'above' | 'below';
  notificationChannels: NotificationChannel[];
}
