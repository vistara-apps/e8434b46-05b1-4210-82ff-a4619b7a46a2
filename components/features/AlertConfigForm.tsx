'use client';

import { useState } from 'react';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AlertFormData, UserAlert } from '@/lib/types';
import { SUPPORTED_CRYPTOCURRENCIES, ALERT_TYPES, NOTIFICATION_CHANNELS } from '@/lib/constants';

interface AlertConfigFormProps {
  onSubmit?: (alertData: AlertFormData) => void;
  editingAlert?: UserAlert | null;
  onCancel?: () => void;
}

export function AlertConfigForm({ onSubmit, editingAlert, onCancel }: AlertConfigFormProps) {
  const [formData, setFormData] = useState<AlertFormData>({
    cryptoSymbol: editingAlert?.cryptoSymbol || 'bitcoin',
    alertType: editingAlert?.alertType || 'price_target',
    thresholdValue: editingAlert?.thresholdValue || 0,
    direction: editingAlert?.direction || 'above',
    notificationChannels: [{ type: 'browser', enabled: true }],
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.cryptoSymbol) {
      newErrors.cryptoSymbol = 'Please select a cryptocurrency';
    }
    
    if (formData.alertType === 'price_target' && formData.thresholdValue <= 0) {
      newErrors.thresholdValue = 'Please enter a valid price target';
    }
    
    if (formData.notificationChannels.length === 0) {
      newErrors.notificationChannels = 'Please select at least one notification channel';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSubmit?.(formData);
      
      // Reset form if not editing
      if (!editingAlert) {
        setFormData({
          cryptoSymbol: 'bitcoin',
          alertType: 'price_target',
          thresholdValue: 0,
          direction: 'above',
          notificationChannels: [{ type: 'browser', enabled: true }],
        });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channelType: 'browser' | 'telegram') => {
    setFormData(prev => ({
      ...prev,
      notificationChannels: prev.notificationChannels.some(c => c.type === channelType)
        ? prev.notificationChannels.filter(c => c.type !== channelType)
        : [...prev.notificationChannels, { type: channelType, enabled: true }]
    }));
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {editingAlert ? (
            <>
              <Target className="h-5 w-5 text-accent" />
              <span>Edit Alert</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 text-accent" />
              <span>Create New Alert</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cryptocurrency Selection */}
          <Select
            label="Cryptocurrency"
            value={formData.cryptoSymbol}
            onChange={(e) => setFormData(prev => ({ ...prev, cryptoSymbol: e.target.value }))}
            options={SUPPORTED_CRYPTOCURRENCIES.map(crypto => ({
              value: crypto.symbol,
              label: `${crypto.name} (${crypto.symbol})`
            }))}
            error={errors.cryptoSymbol}
          />

          {/* Alert Type */}
          <Select
            label="Alert Type"
            value={formData.alertType}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              alertType: e.target.value as 'price_target' | 'trend'
            }))}
            options={ALERT_TYPES.map(type => ({
              value: type.id,
              label: type.name
            }))}
          />

          {/* Price Target (only for price_target alerts) */}
          {formData.alertType === 'price_target' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Direction"
                  value={formData.direction}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    direction: e.target.value as 'above' | 'below'
                  }))}
                  options={[
                    { value: 'above', label: 'Above' },
                    { value: 'below', label: 'Below' }
                  ]}
                />
                
                <Input
                  label="Price Target ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.thresholdValue || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    thresholdValue: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="Enter price"
                  error={errors.thresholdValue}
                />
              </div>
            </>
          )}

          {/* Notification Channels */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">
              Notification Channels
            </label>
            <div className="space-y-2">
              {NOTIFICATION_CHANNELS.map((channel) => (
                <label
                  key={channel.id}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.notificationChannels.some(c => c.type === channel.id)}
                    onChange={() => handleChannelToggle(channel.id as any)}
                    className="rounded border-dark-border bg-dark-surface text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="text-sm text-white">
                    {channel.icon} {channel.name}
                  </span>
                </label>
              ))}
            </div>
            {errors.notificationChannels && (
              <p className="text-sm text-negative">{errors.notificationChannels}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              {editingAlert ? 'Update Alert' : 'Create Alert'}
            </Button>
            
            {editingAlert && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
