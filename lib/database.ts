import { Redis } from '@upstash/redis';
import { User, UserAlert, MarketData } from './types';

// Initialize Redis client for caching and session storage
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Database operations for Users
export class UserDatabase {
  static async create(user: Omit<User, 'userId'>): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      userId,
      ...user,
    };
    
    await redis.hset(`user:${userId}`, {
      ...newUser,
      notificationPreferences: JSON.stringify(newUser.notificationPreferences),
      subscription: newUser.subscription ? JSON.stringify(newUser.subscription) : undefined,
    });
    return newUser;
  }

  static async findById(userId: string): Promise<User | null> {
    const user = await redis.hgetall(`user:${userId}`);
    if (!user || Object.keys(user).length === 0) return null;
    
    return {
      userId: user.userId as string,
      telegramId: user.telegramId as string | undefined,
      notificationPreferences: JSON.parse(user.notificationPreferences as string),
      alertSlots: Number(user.alertSlots),
      subscription: user.subscription ? JSON.parse(user.subscription as string) : undefined,
    };
  }

  static async update(userId: string, updates: Partial<User>): Promise<User | null> {
    const existingUser = await this.findById(userId);
    if (!existingUser) return null;

    const updatedUser = { ...existingUser, ...updates };
    await redis.hset(`user:${userId}`, {
      ...updatedUser,
      notificationPreferences: JSON.stringify(updatedUser.notificationPreferences),
      subscription: updatedUser.subscription ? JSON.stringify(updatedUser.subscription) : undefined,
    });
    
    return updatedUser;
  }

  static async delete(userId: string): Promise<boolean> {
    const result = await redis.del(`user:${userId}`);
    return result > 0;
  }
}

// Database operations for UserAlerts
export class AlertDatabase {
  static async create(alert: Omit<UserAlert, 'alertId'>): Promise<UserAlert> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: UserAlert = {
      alertId,
      ...alert,
    };
    
    // Store alert
    await redis.hset(`alert:${alertId}`, {
      ...newAlert,
      createdAt: newAlert.createdAt.toISOString(),
      triggeredAt: newAlert.triggeredAt?.toISOString(),
      notificationChannels: JSON.stringify(newAlert.notificationChannels),
    });
    
    // Add to user's alert list
    await redis.sadd(`user_alerts:${alert.userId}`, alertId);
    
    // Add to active alerts index for monitoring
    if (newAlert.status === 'active') {
      await redis.sadd('active_alerts', alertId);
    }
    
    return newAlert;
  }

  static async findById(alertId: string): Promise<UserAlert | null> {
    const alert = await redis.hgetall(`alert:${alertId}`);
    if (!alert || Object.keys(alert).length === 0) return null;
    
    return {
      alertId: alert.alertId as string,
      userId: alert.userId as string,
      cryptoSymbol: alert.cryptoSymbol as string,
      alertType: alert.alertType as 'price_target' | 'trend',
      thresholdValue: Number(alert.thresholdValue),
      status: alert.status as 'active' | 'triggered' | 'inactive',
      createdAt: new Date(alert.createdAt as string),
      triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt as string) : undefined,
      direction: alert.direction as 'above' | 'below' | undefined,
      notificationChannels: JSON.parse(alert.notificationChannels as string),
    };
  }

  static async findByUserId(userId: string): Promise<UserAlert[]> {
    const alertIds = await redis.smembers(`user_alerts:${userId}`);
    const alerts: UserAlert[] = [];
    
    for (const alertId of alertIds) {
      const alert = await this.findById(alertId);
      if (alert) alerts.push(alert);
    }
    
    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async findActiveAlerts(): Promise<UserAlert[]> {
    const alertIds = await redis.smembers('active_alerts');
    const alerts: UserAlert[] = [];
    
    for (const alertId of alertIds) {
      const alert = await this.findById(alertId);
      if (alert && alert.status === 'active') {
        alerts.push(alert);
      }
    }
    
    return alerts;
  }

  static async update(alertId: string, updates: Partial<UserAlert>): Promise<UserAlert | null> {
    const existingAlert = await this.findById(alertId);
    if (!existingAlert) return null;

    const updatedAlert = { ...existingAlert, ...updates };
    
    await redis.hset(`alert:${alertId}`, {
      ...updatedAlert,
      createdAt: updatedAlert.createdAt.toISOString(),
      triggeredAt: updatedAlert.triggeredAt?.toISOString(),
      notificationChannels: JSON.stringify(updatedAlert.notificationChannels),
    });
    
    // Update active alerts index
    if (updatedAlert.status === 'active') {
      await redis.sadd('active_alerts', alertId);
    } else {
      await redis.srem('active_alerts', alertId);
    }
    
    return updatedAlert;
  }

  static async delete(alertId: string): Promise<boolean> {
    const alert = await this.findById(alertId);
    if (!alert) return false;
    
    // Remove from user's alert list
    await redis.srem(`user_alerts:${alert.userId}`, alertId);
    
    // Remove from active alerts index
    await redis.srem('active_alerts', alertId);
    
    // Delete the alert
    const result = await redis.del(`alert:${alertId}`);
    return result > 0;
  }
}

// Cache operations for MarketData
export class MarketDataCache {
  static async set(symbol: string, data: MarketData, ttlSeconds: number = 60): Promise<void> {
    await redis.setex(`market:${symbol}`, ttlSeconds, JSON.stringify({
      ...data,
      timestamp: data.timestamp.toISOString(),
    }));
  }

  static async get(symbol: string): Promise<MarketData | null> {
    const data = await redis.get(`market:${symbol}`);
    if (!data) return null;
    
    const parsed = JSON.parse(data as string);
    return {
      ...parsed,
      timestamp: new Date(parsed.timestamp),
    };
  }

  static async setMultiple(dataArray: MarketData[], ttlSeconds: number = 60): Promise<void> {
    const pipeline = redis.pipeline();
    
    for (const data of dataArray) {
      pipeline.setex(`market:${data.symbol}`, ttlSeconds, JSON.stringify({
        ...data,
        timestamp: data.timestamp.toISOString(),
      }));
    }
    
    await pipeline.exec();
  }

  static async getMultiple(symbols: string[]): Promise<MarketData[]> {
    const pipeline = redis.pipeline();
    
    for (const symbol of symbols) {
      pipeline.get(`market:${symbol}`);
    }
    
    const results = await pipeline.exec();
    const marketData: MarketData[] = [];
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i] as [any, any];
      const data = result[1];
      if (data) {
        const parsed = JSON.parse(data as string);
        marketData.push({
          ...parsed,
          timestamp: new Date(parsed.timestamp),
        });
      }
    }
    
    return marketData;
  }
}

// Session management
export class SessionManager {
  static async createSession(userId: string, sessionData: any): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await redis.setex(`session:${sessionId}`, 86400, JSON.stringify({ userId, ...sessionData })); // 24 hours
    return sessionId;
  }

  static async getSession(sessionId: string): Promise<any | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data as string) : null;
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    const result = await redis.del(`session:${sessionId}`);
    return result > 0;
  }
}
