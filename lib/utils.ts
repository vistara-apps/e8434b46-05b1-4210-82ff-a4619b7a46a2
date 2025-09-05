import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(2)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(2)}K`;
  }
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  return `$${price.toFixed(6)}`;
}

export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000000000) {
    return `$${(marketCap / 1000000000000).toFixed(2)}T`;
  }
  if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(2)}B`;
  }
  if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(2)}M`;
  }
  return `$${marketCap.toLocaleString()}`;
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function generateSparklineData(basePrice: number, volatility: number = 0.1): number[] {
  const points = 24; // 24 hours of data
  const data: number[] = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * volatility * basePrice;
    currentPrice += change;
    data.push(Math.max(0, currentPrice));
  }
  
  return data;
}

export function calculateTrendIndicator(sparkline: number[]): 'bullish' | 'bearish' | 'neutral' {
  if (sparkline.length < 2) return 'neutral';
  
  const start = sparkline[0];
  const end = sparkline[sparkline.length - 1];
  const change = (end - start) / start;
  
  if (change > 0.05) return 'bullish';
  if (change < -0.05) return 'bearish';
  return 'neutral';
}

export function validateAlertForm(data: Partial<AlertFormData>): string[] {
  const errors: string[] = [];
  
  if (!data.cryptoSymbol) {
    errors.push('Cryptocurrency symbol is required');
  }
  
  if (!data.alertType) {
    errors.push('Alert type is required');
  }
  
  if (data.alertType === 'price_target') {
    if (!data.thresholdValue || data.thresholdValue <= 0) {
      errors.push('Valid price threshold is required');
    }
    if (!data.direction) {
      errors.push('Price direction is required');
    }
  }
  
  if (!data.notificationChannels || data.notificationChannels.length === 0) {
    errors.push('At least one notification channel must be selected');
  }
  
  return errors;
}
