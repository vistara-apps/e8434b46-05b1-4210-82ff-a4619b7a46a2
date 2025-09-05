'use client';

import { useEffect, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Header } from '@/components/layout/Header';
import { MarketOverview } from '@/components/features/MarketOverview';
import { AlertList } from '@/components/features/AlertList';
import { AlertConfigForm } from '@/components/features/AlertConfigForm';
import { TrendSignals } from '@/components/features/TrendSignals';
import { NotificationSettings } from '@/components/features/NotificationSettings';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, BarChart3, Settings2, Zap } from 'lucide-react';
import { UserAlert, AlertFormData } from '@/lib/types';
import { sendBrowserNotification } from '@/lib/utils';

type ActiveTab = 'overview' | 'alerts' | 'create' | 'trends' | 'settings';

export default function HomePage() {
  const { setFrameReady } = useMiniKit();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [editingAlert, setEditingAlert] = useState<UserAlert | null>(null);
  const [notificationCount, setNotificationCount] = useState(2);

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  const handleCreateAlert = (alertData: AlertFormData) => {
    console.log('Creating alert:', alertData);
    
    // Send confirmation notification
    sendBrowserNotification(
      'Alert Created Successfully!',
      {
        body: `Your ${alertData.alertType} alert for ${alertData.cryptoSymbol.toUpperCase()} has been set up.`,
        icon: '/icon-192x192.png',
      }
    );
    
    // Switch back to alerts tab
    setActiveTab('alerts');
  };

  const handleEditAlert = (alert: UserAlert) => {
    setEditingAlert(alert);
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditingAlert(null);
    setActiveTab('alerts');
  };

  const handleDeleteAlert = (alertId: string) => {
    console.log('Deleting alert:', alertId);
    
    sendBrowserNotification(
      'Alert Deleted',
      {
        body: 'Your alert has been successfully removed.',
        icon: '/icon-192x192.png',
      }
    );
  };

  const handleSaveSettings = (settings: any) => {
    console.log('Saving settings:', settings);
    
    sendBrowserNotification(
      'Settings Saved',
      {
        body: 'Your notification preferences have been updated.',
        icon: '/icon-192x192.png',
      }
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <MarketOverview />
            <TrendSignals />
          </div>
        );
      
      case 'alerts':
        return (
          <AlertList
            onEditAlert={handleEditAlert}
            onDeleteAlert={handleDeleteAlert}
          />
        );
      
      case 'create':
        return (
          <AlertConfigForm
            onSubmit={handleCreateAlert}
            editingAlert={editingAlert}
            onCancel={handleCancelEdit}
          />
        );
      
      case 'trends':
        return <TrendSignals />;
      
      case 'settings':
        return <NotificationSettings onSave={handleSaveSettings} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header notificationCount={notificationCount} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card variant="glass" className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-gradient">
                Welcome to CryptoPulse Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-textSecondary mb-4">
                Never miss a crypto move. Get instant price alerts and trend signals 
                delivered to your preferred channels.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Alert</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('trends')}
                  className="flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>View Trends</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-dark-surface rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'alerts', label: 'My Alerts', icon: Plus },
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'trends', label: 'Trends', icon: Zap },
              { id: 'settings', label: 'Settings', icon: Settings2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-textSecondary hover:text-white hover:bg-dark-border'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="metric">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-textSecondary">Active Alerts</div>
            </div>
          </Card>
          
          <Card variant="metric">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">2</div>
              <div className="text-sm text-textSecondary">Trend Signals</div>
            </div>
          </Card>
          
          <Card variant="metric">
            <div className="text-center">
              <div className="text-2xl font-bold text-positive">$67.5K</div>
              <div className="text-sm text-textSecondary">BTC Price</div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
