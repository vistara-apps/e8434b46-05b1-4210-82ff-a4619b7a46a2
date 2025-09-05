'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketData } from '@/lib/types';
import { fetchMarketData } from '@/lib/api';
import { formatPrice, formatPercentage, formatMarketCap } from '@/lib/utils';
import { MiniChart } from './MiniChart';

export function MarketStats() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const data = await fetchMarketData(['BTC', 'ETH', 'SOL']);
        setMarketData(data);
      } catch (error) {
        console.error('Failed to load market data:', error);
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
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-dark-text">Market Stats</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-dark-card rounded-full"></div>
                  <div>
                    <div className="w-16 h-4 bg-dark-card rounded mb-2"></div>
                    <div className="w-12 h-3 bg-dark-card rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-20 h-5 bg-dark-card rounded mb-2"></div>
                  <div className="w-16 h-4 bg-dark-card rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-dark-text">Market Stats</h2>
        <div className="flex items-center gap-2 text-sm text-dark-textSecondary">
          <div className="w-2 h-2 bg-positive rounded-full animate-pulse"></div>
          Live
        </div>
      </div>

      <div className="grid gap-4">
        {marketData.map((coin) => {
          const isPositive = coin.priceChangePercentage24h >= 0;
          const TrendIcon = isPositive ? TrendingUp : coin.priceChangePercentage24h < 0 ? TrendingDown : Minus;
          
          return (
            <div key={coin.symbol} className="glass-card p-4 hover:bg-dark-card/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {coin.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-text">{coin.name}</h3>
                    <p className="text-sm text-dark-textSecondary">{coin.symbol}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-dark-text">
                    {formatPrice(coin.price)}
                  </p>
                  <div className={`flex items-center gap-1 text-sm ${
                    isPositive ? 'text-positive' : 'text-negative'
                  }`}>
                    <TrendIcon size={14} />
                    {formatPercentage(coin.priceChangePercentage24h)}
                  </div>
                </div>
              </div>

              {/* Mini chart */}
              {coin.sparkline && (
                <div className="mb-4">
                  <MiniChart 
                    data={coin.sparkline} 
                    color={isPositive ? '#22c55e' : '#ef4444'}
                  />
                </div>
              )}

              {/* Additional stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-dark-textSecondary">Market Cap</p>
                  <p className="font-medium text-dark-text">
                    {formatMarketCap(coin.marketCap)}
                  </p>
                </div>
                <div>
                  <p className="text-dark-textSecondary">24h Volume</p>
                  <p className="font-medium text-dark-text">
                    {formatMarketCap(coin.volume24h)}
                  </p>
                </div>
              </div>

              {/* Trend indicator */}
              {coin.trendIndicator && (
                <div className="mt-3 pt-3 border-t border-dark-border">
                  <div className={`trend-indicator ${
                    coin.trendIndicator === 'bullish' ? 'trend-up' :
                    coin.trendIndicator === 'bearish' ? 'trend-down' : 'trend-neutral'
                  }`}>
                    <TrendIcon size={12} />
                    {coin.trendIndicator.charAt(0).toUpperCase() + coin.trendIndicator.slice(1)} Trend
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
