'use client';

import { useState } from 'react';
import { Plus, X, Bell, MessageSquare } from 'lucide-react';
import { AlertFormData, NotificationChannel } from '@/lib/types';
import { SUPPORTED_CRYPTOCURRENCIES, ALERT_TYPES, NOTIFICATION_CHANNELS } from '@/lib/constants';
import { validateAlertForm } from '@/lib/utils';

interface AlertConfigFormProps {
  onSubmit: (data: AlertFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function AlertConfigForm({ onSubmit, onCancel, loading = false }: AlertConfigFormProps) {
  const [formData, setFormData] = useState<Partial<AlertFormData>>({
    cryptoSymbol: '',
    alertType: 'price_target',
    thresholdValue: 0,
    direction: 'above',
    notificationChannels: [
      { type: 'browser', enabled: true },
      { type: 'telegram', enabled: false },
    ],
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateAlertForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData as AlertFormData);
  };

  const updateNotificationChannel = (type: 'browser' | 'telegram', enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      notificationChannels: prev.notificationChannels?.map(channel =>
        channel.type === type ? { ...channel, enabled } : channel
      ) || [],
    }));
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-dark-text">Create New Alert</h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-dark-card rounded-lg transition-colors duration-200"
        >
          <X size={20} className="text-dark-textSecondary" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cryptocurrency Selection */}
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            Cryptocurrency
          </label>
          <select
            value={formData.cryptoSymbol}
            onChange={(e) => setFormData(prev => ({ ...prev, cryptoSymbol: e.target.value }))}
            className="input-field w-full"
            required
          >
            <option value="">Select a cryptocurrency</option>
            {SUPPORTED_CRYPTOCURRENCIES.map((crypto) => (
              <option key={crypto.symbol} value={crypto.symbol}>
                {crypto.icon} {crypto.name} ({crypto.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Alert Type */}
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            Alert Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ALERT_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, alertType: type.id as any }))}
                className={`
                  p-4 rounded-lg border text-left transition-all duration-200
                  ${formData.alertType === type.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-dark-border bg-dark-surface text-dark-text hover:bg-dark-card'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{type.icon}</span>
                  <span className="font-medium">{type.name}</span>
                </div>
                <p className="text-sm opacity-75">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Price Target Configuration */}
        {formData.alertType === 'price_target' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Target Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.thresholdValue || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  thresholdValue: parseFloat(e.target.value) || 0 
                }))}
                className="input-field w-full"
                placeholder="Enter target price"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Alert When Price Goes
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'above', label: 'Above Target', icon: '📈' },
                  { value: 'below', label: 'Below Target', icon: '📉' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, direction: option.value as any }))}
                    className={`
                      p-3 rounded-lg border text-center transition-all duration-200
                      ${formData.direction === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-dark-border bg-dark-surface text-dark-text hover:bg-dark-card'
                      }
                    `}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notification Channels */}
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            Notification Channels
          </label>
          <div className="space-y-3">
            {NOTIFICATION_CHANNELS.map((channel) => {
              const isEnabled = formData.notificationChannels?.find(
                c => c.type === channel.id
              )?.enabled || false;
              
              const Icon = channel.id === 'browser' ? Bell : MessageSquare;
              
              return (
                <div
                  key={channel.id}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 cursor-pointer
                    ${isEnabled
                      ? 'border-primary bg-primary/10'
                      : 'border-dark-border bg-dark-surface hover:bg-dark-card'
                    }
                  `}
                  onClick={() => updateNotificationChannel(channel.id as any, !isEnabled)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${isEnabled ? 'bg-primary text-white' : 'bg-dark-card text-dark-textSecondary'}
                    `}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${isEnabled ? 'text-primary' : 'text-dark-text'}`}>
                        {channel.name}
                      </h4>
                      <p className="text-sm text-dark-textSecondary">
                        {channel.description}
                      </p>
                    </div>
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center
                      ${isEnabled ? 'border-primary bg-primary' : 'border-dark-border'}
                    `}>
                      {isEnabled && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="p-4 bg-negative/10 border border-negative/20 rounded-lg">
            <h4 className="text-sm font-medium text-negative mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-negative space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Alert
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
