'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Bell, AlertTriangle, Target } from 'lucide-react';
import { UserAlert, MarketData, TrendSignal } from '@/lib/types';
import { fetchMarketData, fetchTrendSignals } from '@/lib/api';
import { formatPrice, formatPercentage } from '@/lib/utils';
import { AlertListItem } from './AlertListItem';
import { MiniChart } from './MiniChart';

interface DashboardProps {
  onCreateAlert: () => void;
}

// Mock user alerts for demo
const mockAlerts: UserAlert[] = [
  {
    alertId: '1',
    userId: 'user1',
    cryptoSymbol: 'BTC',
    alertType: 'price_target',
    thresholdValue: 70000,
    status: 'active',
    direction: 'above',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    metadata: {
      currentPrice: 67855.23,
      percentageChange: 1.85,
    },
  },
  {
    alertId: '2',
    userId: 'user1',
    cryptoSymbol: 'ETH',
    alertType: 'trend',
    thresholdValue: 0,
    status: 'triggered',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    triggeredAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    metadata: {
      currentPrice: 3456.78,
      percentageChange: -2.51,
    },
  },
  {
    alertId: '3',
    userId: 'user1',
    cryptoSymbol: 'SOL',
    alertType: 'price_target',
    thresholdValue: 150,
    status: 'inactive',
    direction: 'below',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    metadata: {
      currentPrice: 178.45,
      percentageChange: 7.43,
    },
  },
];

export function Dashboard({ onCreateAlert }: DashboardProps) {
  const [alerts, setAlerts] = useState<UserAlert[]>(mockAlerts);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [trendSignals, setTrendSignals] = useState<TrendSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [market, trends] = await Promise.all([
          fetchMarketData(['BTC', 'ETH', 'SOL']),
          fetchTrendSignals(['BTC', 'ETH', 'SOL']),
        ]);
        
        setMarketData(market);
        setTrendSignals(trends);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const triggeredAlerts = alerts.filter(alert => alert.status === 'triggered');

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.alertId !== alertId));
  };

  const handleToggleStatus = (alertId: string, status: 'active' | 'inactive') => {
    setAlerts(prev => prev.map(alert => 
      alert.alertId === alertId ? { ...alert, status } : alert
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-dark-text">Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="w-full h-20 bg-dark-card rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text">Dashboard</h1>
          <p className="text-dark-textSecondary">Monitor your crypto alerts and market trends</p>
        </div>
        <button onClick={onCreateAlert} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Alert
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dark-textSecondary">Active Alerts</h3>
            <Bell size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-dark-text">{activeAlerts.length}</p>
          <p className="text-xs text-dark-textSecondary mt-1">
            {alerts.length} total alerts
          </p>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dark-textSecondary">Triggered Today</h3>
            <Target size={16} className="text-positive" />
          </div>
          <p className="text-2xl font-bold text-dark-text">{triggeredAlerts.length}</p>
          <p className="text-xs text-positive mt-1">
            +{triggeredAlerts.length} from yesterday
          </p>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dark-textSecondary">Trend Signals</h3>
            <TrendingUp size={16} className="text-accent" />
          </div>
          <p className="text-2xl font-bold text-dark-text">{trendSignals.length}</p>
          <p className="text-xs text-accent mt-1">
            {trendSignals.filter(s => s.signal === 'bullish').length} bullish
          </p>
        </div>
      </div>

      {/* Market Overview */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-dark-text mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketData.slice(0, 3).map((coin) => {
            const isPositive = coin.priceChangePercentage24h >= 0;
            return (
              <div key={coin.symbol} className="p-4 bg-dark-surface rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {coin.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <span className="font-medium text-dark-text">{coin.symbol}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-dark-text">{formatPrice(coin.price)}</p>
                    <p className={`text-xs ${isPositive ? 'text-positive' : 'text-negative'}`}>
                      {formatPercentage(coin.priceChangePercentage24h)}
                    </p>
                  </div>
                </div>
                {coin.sparkline && (
                  <MiniChart 
                    data={coin.sparkline} 
                    color={isPositive ? '#22c55e' : '#ef4444'}
                    height={40}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-text">Recent Alerts</h2>
          <button 
            onClick={onCreateAlert}
            className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
          >
            View All
          </button>
        </div>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle size={48} className="text-dark-textSecondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-text mb-2">No alerts yet</h3>
            <p className="text-dark-textSecondary mb-4">
              Create your first alert to start monitoring crypto prices
            </p>
            <button onClick={onCreateAlert} className="btn-primary">
              Create Alert
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <AlertListItem
                key={alert.alertId}
                alert={alert}
                onDelete={handleDeleteAlert}
                onToggleStatus={handleToggleStatus}
              />
            ))}
            {alerts.length > 3 && (
              <div className="text-center pt-4">
                <button 
                  onClick={onCreateAlert}
                  className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  View {alerts.length - 3} more alerts
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trend Signals */}
      {trendSignals.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-dark-text mb-4">Latest Trend Signals</h2>
          <div className="space-y-3">
            {trendSignals.slice(0, 3).map((signal, index) => (
              <div key={index} className="p-4 bg-dark-surface rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`trend-indicator ${
                      signal.signal === 'bullish' ? 'trend-up' :
                      signal.signal === 'bearish' ? 'trend-down' : 'trend-neutral'
                    }`}>
                      {signal.signal === 'bullish' ? '📈' : signal.signal === 'bearish' ? '📉' : '➡️'}
                      {signal.signal.charAt(0).toUpperCase() + signal.signal.slice(1)}
                    </div>
                    <span className="font-medium text-dark-text">{signal.symbol}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dark-textSecondary">
                      {Math.round(signal.confidence * 100)}% confidence
                    </p>
                    {signal.targetPrice && (
                      <p className="text-xs text-dark-textSecondary">
                        Target: {formatPrice(signal.targetPrice)}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-dark-textSecondary mt-2">{signal.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
