'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendSignal } from '@/lib/types';
import { fetchTrendSignals } from '@/lib/api';
import { formatPrice, getTimeAgo } from '@/lib/utils';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/constants';

export function TrendSignals() {
  const [signals, setSignals] = useState<TrendSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrendSignals = async () => {
      try {
        const data = await fetchTrendSignals(['bitcoin', 'ethereum', 'solana']);
        setSignals(data);
      } catch (error) {
        console.error('Error loading trend signals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrendSignals();
    
    // Refresh signals every 60 seconds
    const interval = setInterval(loadTrendSignals, 60000);
    return () => clearInterval(interval);
  }, []);

  const getCryptoName = (symbol: string) => {
    const crypto = SUPPORTED_CRYPTOCURRENCIES.find(c => c.symbol === symbol);
    return crypto ? crypto.name : symbol.toUpperCase();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-positive';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (loading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-accent" />
            <span>Trend Signals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="p-4 bg-dark-surface rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-600 rounded"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-600 rounded w-20"></div>
                        <div className="h-3 bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-600 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (signals.length === 0) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-accent" />
            <span>Trend Signals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No signals detected</h3>
            <p className="text-textSecondary">
              We'll notify you when we detect potential trend changes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-accent" />
            <span>Trend Signals</span>
          </div>
          <Badge variant="neutral">{signals.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {signals.map((signal, index) => (
            <div
              key={`${signal.symbol}-${index}`}
              className="p-4 bg-dark-surface rounded-lg hover:bg-opacity-80 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {signal.signal === 'bullish' ? (
                      <TrendingUp className="h-6 w-6 text-positive" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-negative" />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium text-white">
                      {getCryptoName(signal.symbol)}
                    </div>
                    <div className="text-sm text-textSecondary">
                      {signal.symbol.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge
                    variant={signal.signal === 'bullish' ? 'positive' : 'negative'}
                  >
                    {signal.signal.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-textSecondary mt-1">
                    <span className={getConfidenceColor(signal.confidence)}>
                      {Math.round(signal.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-textSecondary mb-2">
                {signal.reason}
              </p>
              
              {signal.targetPrice && (
                <div className="text-sm text-white mb-2">
                  Target: {formatPrice(signal.targetPrice)}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{getTimeAgo(signal.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
