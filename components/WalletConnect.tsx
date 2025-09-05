'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useUser } from '@/lib/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, login, logout, loading } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleConnect = async (connector: any) => {
    try {
      setIsAuthenticating(true);
      await connect({ connector });
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    logout();
  };

  // Auto-authenticate when wallet connects
  useState(() => {
    if (isConnected && address && !user && !loading) {
      login(address).catch(console.error);
    }
  });

  if (loading || isAuthenticating) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loading ? 'Loading...' : 'Connecting...'}
      </Button>
    );
  }

  if (isConnected && user) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-400">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <Button
          variant="outline"
          onClick={handleDisconnect}
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-400 mb-4">
        Connect your wallet to get started
      </div>
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => handleConnect(connector)}
          disabled={isPending}
          className="w-full"
          variant="default"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {connector.name}
          {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </Button>
      ))}
    </div>
  );
}
