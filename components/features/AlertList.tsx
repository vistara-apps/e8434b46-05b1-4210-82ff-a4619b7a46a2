'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Target, TrendingUp, Trash2, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserAlert } from '@/lib/types';
import { MOCK_ALERTS, SUPPORTED_CRYPTOCURRENCIES } from '@/lib/constants';
import { formatPrice, getTimeAgo } from '@/lib/utils';

interface AlertListProps {
  onEditAlert?: (alert: UserAlert) => void;
  onDeleteAlert?: (alertId: string) => void;
}

export function AlertList({ onEditAlert, onDeleteAlert }: AlertListProps) {
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading alerts
    setTimeout(() => {
      setAlerts(MOCK_ALERTS);
      setLoading(false);
    }, 1000);
  }, []);

  const getCryptoName = (symbol: string) => {
    const crypto = SUPPORTED_CRYPTOCURRENCIES.find(c => c.symbol === symbol);
    return crypto ? crypto.name : symbol.toUpperCase();
  };

  const getCryptoTicker = (symbol: string) => {
    const crypto = SUPPORTED_CRYPTOCURRENCIES.find(c => c.symbol === symbol);
    return crypto ? crypto.ticker : symbol.toUpperCase();
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.alertId !== alertId));
    onDeleteAlert?.(alertId);
  };

  if (loading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <span>Your Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse alert-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-600 rounded w-24"></div>
                      <div className="h-3 bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <span>Your Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No alerts yet</h3>
            <p className="text-textSecondary mb-4">
              Create your first alert to get notified about price movements
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
            <AlertTriangle className="h-5 w-5 text-accent" />
            <span>Your Alerts</span>
          </div>
          <Badge variant="neutral">{alerts.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.alertId} className="alert-item group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {alert.alertType === 'price_target' ? (
                      <Target className="h-5 w-5 text-primary" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">
                        {getCryptoName(alert.cryptoSymbol)}
                      </span>
                      <span className="text-sm text-textSecondary">
                        ({getCryptoTicker(alert.cryptoSymbol)})
                      </span>
                    </div>
                    
                    <div className="text-sm text-textSecondary">
                      {alert.alertType === 'price_target' ? (
                        <>
                          {alert.direction === 'above' ? 'Above' : 'Below'}{' '}
                          {formatPrice(alert.thresholdValue)}
                        </>
                      ) : (
                        'Trend signal alert'
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      Created {getTimeAgo(alert.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      alert.status === 'active'
                        ? 'positive'
                        : alert.status === 'triggered'
                        ? 'neutral'
                        : 'negative'
                    }
                  >
                    {alert.status}
                  </Badge>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditAlert?.(alert)}
                      className="p-1 h-8 w-8"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.alertId)}
                      className="p-1 h-8 w-8 text-negative hover:text-negative"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
