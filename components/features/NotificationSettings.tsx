'use client';

import { useState } from 'react';
import { Bell, Smartphone, Globe, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { requestNotificationPermission } from '@/lib/utils';

interface NotificationSettingsProps {
  onSave?: (settings: any) => void;
}

export function NotificationSettings({ onSave }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    browserNotifications: true,
    telegramNotifications: false,
    telegramId: '',
    emailNotifications: false,
    email: '',
    soundEnabled: true,
    vibrationEnabled: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  const handleBrowserNotificationToggle = async () => {
    if (!settings.browserNotifications) {
      const permission = await requestNotificationPermission();
      const status = permission ? 'granted' : 'denied';
      setPermissionStatus(status as NotificationPermission);
      
      if (permission) {
        setSettings(prev => ({ ...prev, browserNotifications: true }));
      }
    } else {
      setSettings(prev => ({ ...prev, browserNotifications: false }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSave?.(settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings2 className="h-5 w-5 text-accent" />
          <span>Notification Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium text-white">Browser Notifications</div>
                <div className="text-sm text-textSecondary">
                  Get instant alerts in your browser
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.browserNotifications}
                onChange={handleBrowserNotificationToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {permissionStatus === 'denied' && (
            <div className="text-sm text-negative">
              Browser notifications are blocked. Please enable them in your browser settings.
            </div>
          )}
        </div>

        {/* Telegram Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-accent" />
              <div>
                <div className="font-medium text-white">Telegram Notifications</div>
                <div className="text-sm text-textSecondary">
                  Receive alerts on Telegram
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.telegramNotifications}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  telegramNotifications: e.target.checked 
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          
          {settings.telegramNotifications && (
            <Input
              label="Telegram User ID"
              value={settings.telegramId}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                telegramId: e.target.value 
              }))}
              placeholder="Enter your Telegram user ID"
            />
          )}
        </div>

        {/* Additional Settings */}
        <div className="space-y-4 pt-4 border-t border-dark-border">
          <h4 className="font-medium text-white">Additional Settings</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Sound notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  soundEnabled: e.target.checked 
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Vibration (mobile)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  vibrationEnabled: e.target.checked 
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          loading={loading}
          className="w-full"
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
