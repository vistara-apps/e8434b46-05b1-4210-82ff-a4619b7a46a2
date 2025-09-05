import { NextRequest, NextResponse } from 'next/server';
import { UserAlert } from '@/lib/types';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory storage fallback for development
const memoryStorage = new Map<string, UserAlert[]>();

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceUpdates }: { priceUpdates: PriceUpdate[] } = body;

    if (!priceUpdates || !Array.isArray(priceUpdates)) {
      return NextResponse.json(
        { success: false, error: 'Price updates array is required' },
        { status: 400 }
      );
    }

    const triggeredAlerts: Array<{
      alert: UserAlert;
      currentPrice: number;
      userId: string;
    }> = [];

    // Process each price update
    for (const update of priceUpdates) {
      const { symbol, price } = update;
      
      // Get all users' alerts (in production, this would be more efficient with proper indexing)
      const allUserIds = await getAllUserIds();
      
      for (const userId of allUserIds) {
        let userAlerts: UserAlert[] = [];
        
        if (redis) {
          const redisAlerts = await redis.get(`alerts:${userId}`);
          userAlerts = redisAlerts ? JSON.parse(redisAlerts as string) : [];
        } else {
          userAlerts = memoryStorage.get(userId) || [];
        }

        // Check each alert for this user
        for (const alert of userAlerts) {
          if (alert.status !== 'active' || alert.cryptoSymbol !== symbol.toUpperCase()) {
            continue;
          }

          let shouldTrigger = false;

          if (alert.alertType === 'price_target') {
            if (alert.direction === 'above' && price >= alert.thresholdValue) {
              shouldTrigger = true;
            } else if (alert.direction === 'below' && price <= alert.thresholdValue) {
              shouldTrigger = true;
            }
          }

          if (shouldTrigger) {
            // Update alert status
            alert.status = 'triggered';
            alert.triggeredAt = new Date();
            alert.metadata = {
              ...alert.metadata,
              currentPrice: price,
            };

            triggeredAlerts.push({
              alert,
              currentPrice: price,
              userId,
            });

            // Save updated alerts
            if (redis) {
              await redis.set(`alerts:${userId}`, JSON.stringify(userAlerts));
            } else {
              memoryStorage.set(userId, userAlerts);
            }
          }
        }
      }
    }

    // Send notifications for triggered alerts
    for (const { alert, currentPrice, userId } of triggeredAlerts) {
      await sendAlertNotification(alert, currentPrice, userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        processedUpdates: priceUpdates.length,
        triggeredAlerts: triggeredAlerts.length,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Price monitor webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process price updates' },
      { status: 500 }
    );
  }
}

async function getAllUserIds(): Promise<string[]> {
  // In production, this would be more efficient with proper database indexing
  // For now, we'll use a simple approach
  
  if (redis) {
    try {
      // Get all user keys
      const keys = await redis.keys('user:*');
      return keys.map(key => key.replace('user:', ''));
    } catch (error) {
      console.error('Error getting user IDs from Redis:', error);
      return [];
    }
  } else {
    // For memory storage, we need to track user IDs separately
    // This is a simplified approach for development
    return Array.from(memoryStorage.keys());
  }
}

async function sendAlertNotification(
  alert: UserAlert,
  currentPrice: number,
  userId: string
): Promise<void> {
  try {
    const title = `🚨 ${alert.cryptoSymbol} Price Alert`;
    const direction = alert.direction === 'above' ? 'above' : 'below';
    const message = `${alert.cryptoSymbol} has reached $${currentPrice.toFixed(2)}, which is ${direction} your target of $${alert.thresholdValue.toFixed(2)}`;

    // Get user data for notification preferences
    let user = null;
    if (redis) {
      const redisUser = await redis.get(`user:${userId}`);
      user = redisUser ? JSON.parse(redisUser as string) : null;
    }

    const channels: ('browser' | 'telegram')[] = [];
    let telegramChatId: string | undefined;

    if (user) {
      if (user.notificationPreferences.browser) {
        channels.push('browser');
      }
      if (user.notificationPreferences.telegram && user.telegramId) {
        channels.push('telegram');
        telegramChatId = user.telegramId;
      }
    } else {
      // Default to browser notifications if user data not found
      channels.push('browser');
    }

    // Send notification via API
    const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        message,
        channels,
        telegramChatId,
        alertId: alert.alertId,
      }),
    });

    if (!notificationResponse.ok) {
      console.error('Failed to send notification:', await notificationResponse.text());
    }

  } catch (error) {
    console.error('Error sending alert notification:', error);
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Price monitor webhook is running',
    endpoint: 'POST /api/webhooks/price-monitor',
    expectedPayload: {
      priceUpdates: [
        {
          symbol: 'BTC',
          price: 43250.50,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  });
}
