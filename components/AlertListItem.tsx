'use client';

import { useState } from 'react';
import { 
  Bell, 
  TrendingUp, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Pause, 
  Play,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { UserAlert } from '@/lib/types';
import { formatPrice, formatPercentage, getTimeAgo } from '@/lib/utils';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/constants';

interface AlertListItemProps {
  alert: UserAlert;
  onEdit?: (alert: UserAlert) => void;
  onDelete?: (alertId: string) => void;
  onToggleStatus?: (alertId: string, status: 'active' | 'inactive') => void;
}

export function AlertListItem({ 
  alert, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: AlertListItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const crypto = SUPPORTED_CRYPTOCURRENCIES.find(c => c.symbol === alert.cryptoSymbol);
  const isActive = alert.status === 'active';
  const isTriggered = alert.status === 'triggered';
  
  const getStatusIcon = () => {
    switch (alert.status) {
      case 'active':
        return <Bell size={16} className="text-primary" />;
      case 'triggered':
        return <CheckCircle size={16} className="text-positive" />;
      case 'inactive':
        return <Pause size={16} className="text-dark-textSecondary" />;
      default:
        return <AlertTriangle size={16} className="text-negative" />;
    }
  };

  const getStatusColor = () => {
    switch (alert.status) {
      case 'active':
        return 'text-primary';
      case 'triggered':
        return 'text-positive';
      case 'inactive':
        return 'text-dark-textSecondary';
      default:
        return 'text-negative';
    }
  };

  const getAlertTypeIcon = () => {
    return alert.alertType === 'price_target' ? '🎯' : '📈';
  };

  const formatAlertDescription = () => {
    if (alert.alertType === 'price_target') {
      return `${alert.direction === 'above' ? 'Above' : 'Below'} ${formatPrice(alert.thresholdValue)}`;
    }
    return 'Trend Signal';
  };

  return (
    <div className={`
      alert-card relative
      ${isTriggered ? 'border-positive/30 bg-positive/5' : ''}
      ${!isActive && !isTriggered ? 'opacity-60' : ''}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Crypto Icon */}
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {crypto?.icon || alert.cryptoSymbol.slice(0, 2)}
            </span>
          </div>

          {/* Alert Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-dark-text">
                {crypto?.name || alert.cryptoSymbol}
              </h3>
              <span className="text-lg">{getAlertTypeIcon()}</span>
              {getStatusIcon()}
            </div>
            
            <p className="text-sm text-dark-textSecondary mb-2">
              {formatAlertDescription()}
            </p>

            {/* Current Price & Change */}
            {alert.metadata?.currentPrice && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-dark-text">
                  Current: {formatPrice(alert.metadata.currentPrice)}
                </span>
                {alert.metadata.percentageChange !== undefined && (
                  <span className={
                    alert.metadata.percentageChange >= 0 ? 'text-positive' : 'text-negative'
                  }>
                    {formatPercentage(alert.metadata.percentageChange)}
                  </span>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-4 mt-2 text-xs text-dark-textSecondary">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                Created {getTimeAgo(alert.createdAt)}
              </div>
              {alert.triggeredAt && (
                <div className="flex items-center gap-1">
                  <CheckCircle size={12} />
                  Triggered {getTimeAgo(alert.triggeredAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status & Menu */}
        <div className="flex items-center gap-2">
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor()}`}>
            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-dark-card rounded transition-colors duration-200"
            >
              <MoreVertical size={16} className="text-dark-textSecondary" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-48 bg-dark-surface border border-dark-border rounded-lg shadow-dark-card py-1">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(alert);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-dark-text hover:bg-dark-card flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit Alert
                    </button>
                  )}
                  
                  {onToggleStatus && (
                    <button
                      onClick={() => {
                        onToggleStatus(alert.alertId, isActive ? 'inactive' : 'active');
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-dark-text hover:bg-dark-card flex items-center gap-2"
                    >
                      {isActive ? <Pause size={14} /> : <Play size={14} />}
                      {isActive ? 'Pause Alert' : 'Resume Alert'}
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(alert.alertId);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-negative hover:bg-negative/10 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete Alert
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
