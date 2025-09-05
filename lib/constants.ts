export const SUPPORTED_CRYPTOCURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', icon: '◎' },
  { symbol: 'ADA', name: 'Cardano', icon: '₳' },
  { symbol: 'DOT', name: 'Polkadot', icon: '●' },
  { symbol: 'LINK', name: 'Chainlink', icon: '⬢' },
  { symbol: 'MATIC', name: 'Polygon', icon: '⬟' },
  { symbol: 'AVAX', name: 'Avalanche', icon: '▲' },
  { symbol: 'UNI', name: 'Uniswap', icon: '🦄' },
  { symbol: 'AAVE', name: 'Aave', icon: '👻' },
];

export const ALERT_TYPES = [
  {
    id: 'price_target',
    name: 'Price Target',
    description: 'Get notified when price reaches a specific value',
    icon: '🎯',
  },
  {
    id: 'trend',
    name: 'Trend Signal',
    description: 'Get notified about potential trend changes',
    icon: '📈',
  },
];

export const NOTIFICATION_CHANNELS = [
  {
    id: 'browser',
    name: 'Browser Notifications',
    description: 'Instant notifications in your browser',
    icon: '🔔',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Messages sent to your Telegram',
    icon: '📱',
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    alertSlots: 3,
    features: [
      '3 active alerts',
      'Basic price notifications',
      'Browser notifications only',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 5,
    alertSlots: -1, // unlimited
    features: [
      'Unlimited alerts',
      'Advanced trend signals',
      'Multi-channel notifications',
      'Priority support',
      'Market insights',
    ],
  },
];

export const MOCK_MARKET_DATA = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67855.23,
    priceChange24h: 1234.56,
    priceChangePercentage24h: 1.85,
    marketCap: 1340000000000,
    volume24h: 28500000000,
    trendIndicator: 'bullish' as const,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3456.78,
    priceChange24h: -89.12,
    priceChangePercentage24h: -2.51,
    marketCap: 415000000000,
    volume24h: 15200000000,
    trendIndicator: 'bearish' as const,
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 178.45,
    priceChange24h: 12.34,
    priceChangePercentage24h: 7.43,
    marketCap: 82000000000,
    volume24h: 3400000000,
    trendIndicator: 'bullish' as const,
  },
];

export const MOCK_ALERTS = [
  {
    alertId: '1',
    userId: 'user1',
    cryptoSymbol: 'BTC',
    alertType: 'price_target' as const,
    thresholdValue: 70000,
    status: 'active' as const,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    direction: 'above' as const,
  },
  {
    alertId: '2',
    userId: 'user1',
    cryptoSymbol: 'ETH',
    alertType: 'trend' as const,
    thresholdValue: 0,
    status: 'triggered' as const,
    createdAt: new Date('2024-01-14T15:30:00Z'),
    triggeredAt: new Date('2024-01-15T09:45:00Z'),
  },
  {
    alertId: '3',
    userId: 'user1',
    cryptoSymbol: 'SOL',
    alertType: 'price_target' as const,
    thresholdValue: 150,
    status: 'active' as const,
    createdAt: new Date('2024-01-13T08:20:00Z'),
    direction: 'below' as const,
  },
];

export const API_ENDPOINTS = {
  COINGECKO_PRICE: 'https://api.coingecko.com/api/v3/simple/price',
  COINGECKO_MARKETS: 'https://api.coingecko.com/api/v3/coins/markets',
  TELEGRAM_BOT: 'https://api.telegram.org/bot',
};

export const CHART_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280',
  primary: '#3b82f6',
  accent: '#10b981',
};
