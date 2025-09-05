'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useUser } from '@/lib/contexts/UserContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WalletConnect } from '@/components/WalletConnect';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AlertsManager } from '@/components/AlertsManager';
import { MarketStats } from '@/components/MarketStats';
import { Settings } from '@/components/Settings';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { setFrameReady } = useMiniKit();
  const { user, loading } = useUser();

  useEffect(() => {
    // Initialize the MiniKit frame
    setFrameReady();
  }, [setFrameReady]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onCreateAlert={() => setActiveSection('alerts')} />;
      case 'alerts':
        return <AlertsManager />;
      case 'market':
        return <MarketStats />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onCreateAlert={() => setActiveSection('alerts')} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400">Loading CryptoPulse Alerts...</p>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-surface rounded-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              CryptoPulse Alerts
            </h1>
            <p className="text-gray-400">
              Never miss a crypto move. Get instant price alerts and trend signals.
            </p>
          </div>
          
          <ErrorBoundary>
            <WalletConnect />
          </ErrorBoundary>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By connecting your wallet, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-dark-bg">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          
          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8 max-w-6xl">
              <ErrorBoundary>
                {renderContent()}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
