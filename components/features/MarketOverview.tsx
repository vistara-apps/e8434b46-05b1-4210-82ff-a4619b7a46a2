'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MarketData } from '@/lib/types';
import { fetchMarketData } from '@/lib/api';
import { formatPrice, formatPercentage } from '@/lib/utils';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/constants';

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const data = await fetchMarketData(['bitcoin', 'ethereum', 'solana']);
        setMarketData(data);
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMarketData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-accent" />
            <span>Market Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-600 rounded w-20"></div>
                      <div className="h-3 bg-gray-600 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="h-4 bg-gray-600 rounded w-16"></div>
                    <div className="h-3 bg-gray-600 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-accent" />
          <span>Market Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketData.map((crypto) => (
            <div
              key={crypto.symbol}
              className="flex items-center justify-between p-3 bg-dark-surface rounded-lg hover:bg-opacity-80 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center text-lg">
                  {SUPPORTED_CRYPTOCURRENCIES.find(c => c.symbol === crypto.symbol.toUpperCase())?.icon || '💰'}
                </div>
                <div>
                  <div className="font-medium text-white">{crypto.name}</div>
                  <div className="text-sm text-textSecondary">
                    {crypto.symbol.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-white">
                  {formatPrice(crypto.price)}
                </div>
                <div className="flex items-center space-x-1">
                  {crypto.priceChangePercentage24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-positive" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-negative" />
                  )}
                  <span
                    className={
                      crypto.priceChangePercentage24h >= 0
                        ? 'text-positive'
                        : 'text-negative'
                    }
                  >
                    {formatPercentage(crypto.priceChangePercentage24h)}
                  </span>
                </div>
              </div>
              
              {crypto.trendIndicator && (
                <Badge
                  variant={
                    crypto.trendIndicator === 'bullish'
                      ? 'positive'
                      : crypto.trendIndicator === 'bearish'
                      ? 'negative'
                      : 'neutral'
                  }
                >
                  {crypto.trendIndicator}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
