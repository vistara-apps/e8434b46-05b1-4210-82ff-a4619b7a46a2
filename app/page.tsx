'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AlertsManager } from '@/components/AlertsManager';
import { MarketStats } from '@/components/MarketStats';
import { Settings } from '@/components/Settings';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { setFrameReady } = useMiniKit();

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

  return (
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
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
