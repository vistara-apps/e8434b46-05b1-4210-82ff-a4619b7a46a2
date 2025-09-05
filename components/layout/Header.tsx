'use client';

import { Bell, Settings2, User } from 'lucide-react';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  notificationCount?: number;
}

export function Header({ notificationCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-border bg-dark-bg/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💎</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">CryptoPulse</h1>
              <p className="text-xs text-textSecondary">Alerts</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="negative" 
                  className="notification-badge"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
              <Settings2 className="h-5 w-5" />
            </button>

            {/* Wallet Connection */}
            <Wallet>
              <ConnectWallet>
                <Avatar className="h-8 w-8" />
                <Name className="text-white" />
              </ConnectWallet>
            </Wallet>
          </div>
        </div>
      </div>
    </header>
  );
}
