'use client';

import { useState } from 'react';
import { 
  Bell, 
  MessageSquare, 
  CreditCard, 
  Shield, 
  Smartphone,
  Mail,
  Save,
  ExternalLink
} from 'lucide-react';

interface SettingsData {
  notifications: {
    browser: boolean;
    telegram: boolean;
    email: boolean;
  };
  telegram: {
    connected: boolean;
    username: string;
    chatId: string;
  };
  subscription: {
    plan: 'free' | 'premium';
    alertSlots: number;
    expiresAt?: Date;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
  };
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      browser: true,
      telegram: false,
      email: false,
    },
    telegram: {
      connected: false,
      username: '',
      chatId: '',
    },
    subscription: {
      plan: 'free',
      alertSlots: 3,
    },
    privacy: {
      dataSharing: false,
      analytics: true,
    },
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    
    // Show success message (in a real app, you'd use a toast notification)
    alert('Settings saved successfully!');
  };

  const handleConnectTelegram = () => {
    // In a real app, this would redirect to Telegram bot
    window.open('https://t.me/cryptopulse_alerts_bot', '_blank');
  };

  const handleUpgradePlan = () => {
    // In a real app, this would open payment modal
    alert('Payment integration would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-text">Settings</h1>
        <p className="text-dark-textSecondary">Manage your account preferences and notifications</p>
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-dark-text">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'browser',
              icon: Bell,
              title: 'Browser Notifications',
              description: 'Get instant notifications in your browser',
            },
            {
              key: 'telegram',
              icon: MessageSquare,
              title: 'Telegram Messages',
              description: 'Receive alerts via Telegram bot',
            },
            {
              key: 'email',
              icon: Mail,
              title: 'Email Notifications',
              description: 'Get daily summaries via email',
            },
          ].map((option) => {
            const Icon = option.icon;
            const isEnabled = settings.notifications[option.key as keyof typeof settings.notifications];
            
            return (
              <div key={option.key} className="flex items-center justify-between p-4 bg-dark-surface rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isEnabled ? 'bg-primary text-white' : 'bg-dark-card text-dark-textSecondary'}
                  `}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-text">{option.title}</h3>
                    <p className="text-sm text-dark-textSecondary">{option.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      [option.key]: !isEnabled,
                    },
                  }))}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors duration-200
                    ${isEnabled ? 'bg-primary' : 'bg-dark-border'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                    ${isEnabled ? 'translate-x-7' : 'translate-x-1'}
                  `} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telegram Integration */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare size={20} className="text-accent" />
          <h2 className="text-lg font-bold text-dark-text">Telegram Integration</h2>
        </div>

        {settings.telegram.connected ? (
          <div className="p-4 bg-positive/10 border border-positive/20 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-positive rounded-full"></div>
              <span className="text-positive font-medium">Connected</span>
            </div>
            <p className="text-sm text-dark-textSecondary">
              Username: @{settings.telegram.username}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-dark-surface rounded-lg">
              <p className="text-dark-textSecondary mb-3">
                Connect your Telegram account to receive alerts directly in your messages.
              </p>
              <button
                onClick={handleConnectTelegram}
                className="btn-primary flex items-center gap-2"
              >
                <MessageSquare size={16} />
                Connect Telegram
                <ExternalLink size={14} />
              </button>
            </div>
            
            <div className="text-sm text-dark-textSecondary">
              <p className="font-medium mb-2">How to connect:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Click "Connect Telegram" to open our bot</li>
                <li>Send /start to the bot</li>
                <li>Follow the verification steps</li>
                <li>Return here to confirm connection</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Subscription */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={20} className="text-accent" />
          <h2 className="text-lg font-bold text-dark-text">Subscription</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-dark-surface rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-dark-text">
                  {settings.subscription.plan === 'free' ? 'Free Plan' : 'Premium Plan'}
                </h3>
                <p className="text-sm text-dark-textSecondary">
                  {settings.subscription.alertSlots === -1 
                    ? 'Unlimited alerts' 
                    : `${settings.subscription.alertSlots} alert slots`
                  }
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                settings.subscription.plan === 'premium' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-dark-border text-dark-textSecondary'
              }`}>
                {settings.subscription.plan.toUpperCase()}
              </div>
            </div>

            {settings.subscription.plan === 'free' && (
              <div className="space-y-3">
                <div className="text-sm text-dark-textSecondary">
                  <p className="mb-2">Upgrade to Premium for:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Unlimited alerts</li>
                    <li>Advanced trend signals</li>
                    <li>Multi-channel notifications</li>
                    <li>Priority support</li>
                  </ul>
                </div>
                <button
                  onClick={handleUpgradePlan}
                  className="btn-primary"
                >
                  Upgrade to Premium - $5/month
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-dark-text">Privacy & Data</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'dataSharing',
              title: 'Data Sharing',
              description: 'Share anonymized usage data to improve the service',
            },
            {
              key: 'analytics',
              title: 'Analytics',
              description: 'Allow analytics to help us understand app usage',
            },
          ].map((option) => {
            const isEnabled = settings.privacy[option.key as keyof typeof settings.privacy];
            
            return (
              <div key={option.key} className="flex items-center justify-between p-4 bg-dark-surface rounded-lg">
                <div>
                  <h3 className="font-medium text-dark-text">{option.title}</h3>
                  <p className="text-sm text-dark-textSecondary">{option.description}</p>
                </div>
                
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    privacy: {
                      ...prev.privacy,
                      [option.key]: !isEnabled,
                    },
                  }))}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors duration-200
                    ${isEnabled ? 'bg-primary' : 'bg-dark-border'}
                  `}
                >
                  <div className={`
                    absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                    ${isEnabled ? 'translate-x-7' : 'translate-x-1'}
                  `} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
