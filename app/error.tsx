'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-negative/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-negative" />
        </div>
        
        <h2 className="text-xl font-bold text-dark-text mb-2">
          Something went wrong!
        </h2>
        
        <p className="text-dark-textSecondary mb-6">
          We encountered an error while loading CryptoPulse Alerts. Please try again.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary w-full"
          >
            Reload Page
          </button>
        </div>
        
        {error.digest && (
          <p className="text-xs text-dark-textSecondary mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
