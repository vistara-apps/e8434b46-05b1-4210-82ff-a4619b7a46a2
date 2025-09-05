export const SUPPORTED_CRYPTOCURRENCIES = [
  { symbol: 'bitcoin', name: 'Bitcoin', ticker: 'BTC' },
  { symbol: 'ethereum', name: 'Ethereum', ticker: 'ETH' },
  { symbol: 'binancecoin', name: 'BNB', ticker: 'BNB' },
  { symbol: 'cardano', name: 'Cardano', ticker: 'ADA' },
  { symbol: 'solana', name: 'Solana', ticker: 'SOL' },
  { symbol: 'polkadot', name: 'Polkadot', ticker: 'DOT' },
  { symbol: 'chainlink', name: 'Chainlink', ticker: 'LINK' },
  { symbol: 'polygon', name: 'Polygon', ticker: 'MATIC' },
  { symbol: 'avalanche-2', name: 'Avalanche', ticker: 'AVAX' },
  { symbol: 'uniswap', name: 'Uniswap', ticker: 'UNI' },
];

export const ALERT_TYPES = [
  { value: 'price_target', label: 'Price Target', description: 'Get notified when price reaches a specific value' },
  { value: 'trend', label: 'Trend Signal', description: 'Get notified about potential trend changes' },
];

export const NOTIFICATION_CHANNELS = [
  { value: 'browser', label: 'Browser Notifications', icon: '🔔' },
  { value: 'telegram', label: 'Telegram', icon: '📱' },
];

export const PRICING = {
  ALERT_SLOT_PRICE: 0.5, // $0.50 per slot
  MONTHLY_SUBSCRIPTION: 5.0, // $5/month for unlimited
  FREE_ALERT_SLOTS: 3,
};

export const API_ENDPOINTS = {
  COINGECKO_PRICE: 'https://api.coingecko.com/api/v3/simple/price',
  COINGECKO_MARKETS: 'https://api.coingecko.com/api/v3/coins/markets',
  COINGECKO_HISTORY: 'https://api.coingecko.com/api/v3/coins/{id}/market_chart',
};

export const TREND_INDICATORS = {
  BULLISH: { label: 'Bullish', color: 'text-positive', bgColor: 'bg-positive' },
  BEARISH: { label: 'Bearish', color: 'text-negative', bgColor: 'bg-negative' },
  NEUTRAL: { label: 'Neutral', color: 'text-gray-400', bgColor: 'bg-gray-400' },
};

export const MOCK_ALERTS = [
  {
    alertId: '1',
    userId: 'user1',
    cryptoSymbol: 'bitcoin',
    alertType: 'price_target' as const,
    thresholdValue: 75000,
    status: 'active' as const,
    createdAt: new Date(),
    direction: 'above' as const,
    notificationChannels: ['browser', 'telegram'] as ('browser' | 'telegram')[],
  },
  {
    alertId: '2',
    userId: 'user1',
    cryptoSymbol: 'ethereum',
    alertType: 'trend' as const,
    thresholdValue: 0,
    status: 'active' as const,
    createdAt: new Date(),
    notificationChannels: ['browser'] as ('browser' | 'telegram')[],
  },
];
