'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'positive' | 'negative' | 'neutral';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      positive: 'bg-positive bg-opacity-20 text-positive',
      negative: 'bg-negative bg-opacity-20 text-negative',
      neutral: 'bg-gray-400 bg-opacity-20 text-gray-400',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
