import { NotificationPayload } from './types';

// Browser notification utilities
export class BrowserNotifications {
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }
    
    return Notification.permission;
  }
  
  static async send(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options,
      });
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
      
      return Promise.resolve();
    } else {
      throw new Error('Notification permission denied');
    }
  }
  
  static isSupported(): boolean {
    return 'Notification' in window;
  }
  
  static getPermission(): NotificationPermission {
    return Notification.permission;
  }
}

// Service Worker for background notifications
export class ServiceWorkerNotifications {
  static async register(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }
  
  static async sendNotification(
    payload: NotificationPayload,
    registration?: ServiceWorkerRegistration
  ): Promise<void> {
    if (!registration) {
      registration = await navigator.serviceWorker.ready;
    }
    
    await registration.showNotification(payload.title, {
      body: payload.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: payload.type,
      data: payload.data,
      actions: [
        {
          action: 'view',
          title: 'View Details',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    } as any);
  }
}

// Push notification utilities
export class PushNotifications {
  static async subscribe(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
      });
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }
  
  static async unsubscribe(subscription: PushSubscription): Promise<boolean> {
    try {
      return await subscription.unsubscribe();
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }
  
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

// Notification manager that handles all types
export class NotificationManager {
  private static instance: NotificationManager;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }
  
  async initialize(): Promise<void> {
    // Register service worker
    this.serviceWorkerRegistration = await ServiceWorkerNotifications.register();
    
    // Request notification permission
    await BrowserNotifications.requestPermission();
  }
  
  async sendPriceAlert(
    cryptoSymbol: string,
    currentPrice: number,
    targetPrice: number,
    direction: 'above' | 'below'
  ): Promise<void> {
    const title = `🚨 ${cryptoSymbol.toUpperCase()} Price Alert`;
    const message = `Price has ${direction === 'above' ? 'risen above' : 'fallen below'} $${targetPrice.toLocaleString()}. Current price: $${currentPrice.toLocaleString()}`;
    
    const payload: NotificationPayload = {
      title,
      message,
      type: 'price_alert',
      data: {
        symbol: cryptoSymbol,
        currentPrice,
        targetPrice,
        direction,
      },
    };
    
    // Try service worker notification first, fallback to browser notification
    try {
      if (this.serviceWorkerRegistration) {
        await ServiceWorkerNotifications.sendNotification(payload, this.serviceWorkerRegistration);
      } else {
        await BrowserNotifications.send(title, { body: message });
      }
    } catch (error) {
      console.error('Failed to send price alert notification:', error);
      // Fallback to basic browser notification
      try {
        await BrowserNotifications.send(title, { body: message });
      } catch (fallbackError) {
        console.error('All notification methods failed:', fallbackError);
      }
    }
  }
  
  async sendTrendSignal(
    cryptoSymbol: string,
    signal: 'bullish' | 'bearish',
    confidence: number,
    reason: string
  ): Promise<void> {
    const emoji = signal === 'bullish' ? '📈' : '📉';
    const title = `${emoji} ${cryptoSymbol.toUpperCase()} Trend Signal`;
    const message = `${signal.toUpperCase()} signal detected (${Math.round(confidence * 100)}% confidence). ${reason}`;
    
    const payload: NotificationPayload = {
      title,
      message,
      type: 'trend_signal',
      data: {
        symbol: cryptoSymbol,
        signal,
        confidence,
        reason,
      },
    };
    
    try {
      if (this.serviceWorkerRegistration) {
        await ServiceWorkerNotifications.sendNotification(payload, this.serviceWorkerRegistration);
      } else {
        await BrowserNotifications.send(title, { body: message });
      }
    } catch (error) {
      console.error('Failed to send trend signal notification:', error);
      try {
        await BrowserNotifications.send(title, { body: message });
      } catch (fallbackError) {
        console.error('All notification methods failed:', fallbackError);
      }
    }
  }
  
  async sendMarketUpdate(title: string, message: string, data?: any): Promise<void> {
    const payload: NotificationPayload = {
      title,
      message,
      type: 'market_update',
      data,
    };
    
    try {
      if (this.serviceWorkerRegistration) {
        await ServiceWorkerNotifications.sendNotification(payload, this.serviceWorkerRegistration);
      } else {
        await BrowserNotifications.send(title, { body: message });
      }
    } catch (error) {
      console.error('Failed to send market update notification:', error);
      try {
        await BrowserNotifications.send(title, { body: message });
      } catch (fallbackError) {
        console.error('All notification methods failed:', fallbackError);
      }
    }
  }
  
  getPermissionStatus(): NotificationPermission {
    return BrowserNotifications.getPermission();
  }
  
  isSupported(): boolean {
    return BrowserNotifications.isSupported();
  }
}
