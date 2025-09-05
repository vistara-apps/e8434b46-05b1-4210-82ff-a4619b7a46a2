'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

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
      <Card variant="glass" className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-negative bg-opacity-20 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <AlertTriangle className="h-8 w-8 text-negative" />
          </div>
          <CardTitle className="text-xl text-white">Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-textSecondary">
            We encountered an unexpected error. This might be a temporary issue.
          </p>
          
          {error.message && (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-3">
              <p className="text-sm text-negative font-mono">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go Home
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            If the problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
