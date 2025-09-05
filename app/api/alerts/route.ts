import { NextRequest, NextResponse } from 'next/server';
import { UserAlert, AlertFormData } from '@/lib/types';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    let alerts: UserAlert[] = [];

    if (redis) {
      // Use Redis in production
      const redisAlerts = await redis.get(`alerts:${userId}`);
      alerts = redisAlerts ? JSON.parse(redisAlerts as string) : [];
    } else {
      // Use memory storage in development
      alerts = memoryStorage.get(userId) || [];
    }

    // Parse dates from stored data
    alerts = alerts.map(alert => ({
      ...alert,
      createdAt: new Date(alert.createdAt),
      triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, alertData }: { userId: string; alertData: AlertFormData } = body;

    if (!userId || !alertData) {
      return NextResponse.json(
        { success: false, error: 'User ID and alert data are required' },
        { status: 400 }
      );
    }

    // Validate alert data
    if (!alertData.cryptoSymbol || !alertData.alertType || !alertData.thresholdValue) {
      return NextResponse.json(
        { success: false, error: 'Missing required alert fields' },
        { status: 400 }
      );
    }

    // Get existing alerts
    let existingAlerts: UserAlert[] = [];
    
    if (redis) {
      const redisAlerts = await redis.get(`alerts:${userId}`);
      existingAlerts = redisAlerts ? JSON.parse(redisAlerts as string) : [];
    } else {
      existingAlerts = memoryStorage.get(userId) || [];
    }

    // Check alert limits (free tier: 3 alerts, premium: unlimited)
    const activeAlerts = existingAlerts.filter(alert => alert.status === 'active');
    if (activeAlerts.length >= 3) {
      // In a real app, check user subscription here
      return NextResponse.json(
        { success: false, error: 'Alert limit reached. Upgrade to premium for unlimited alerts.' },
        { status: 403 }
      );
    }

    // Create new alert
    const newAlert: UserAlert = {
      alertId: generateAlertId(),
      userId,
      cryptoSymbol: alertData.cryptoSymbol.toUpperCase(),
      alertType: alertData.alertType,
      thresholdValue: alertData.thresholdValue,
      direction: alertData.direction,
      status: 'active',
      createdAt: new Date(),
      metadata: {},
    };

    // Add to existing alerts
    const updatedAlerts = [...existingAlerts, newAlert];

    // Save to storage
    if (redis) {
      await redis.set(`alerts:${userId}`, JSON.stringify(updatedAlerts));
    } else {
      memoryStorage.set(userId, updatedAlerts);
    }

    return NextResponse.json({
      success: true,
      data: newAlert,
      message: 'Alert created successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const alertId = searchParams.get('alertId');

    if (!userId || !alertId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Alert ID are required' },
        { status: 400 }
      );
    }

    // Get existing alerts
    let existingAlerts: UserAlert[] = [];
    
    if (redis) {
      const redisAlerts = await redis.get(`alerts:${userId}`);
      existingAlerts = redisAlerts ? JSON.parse(redisAlerts as string) : [];
    } else {
      existingAlerts = memoryStorage.get(userId) || [];
    }

    // Remove the alert
    const updatedAlerts = existingAlerts.filter(alert => alert.alertId !== alertId);

    if (updatedAlerts.length === existingAlerts.length) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    // Save updated alerts
    if (redis) {
      await redis.set(`alerts:${userId}`, JSON.stringify(updatedAlerts));
    } else {
      memoryStorage.set(userId, updatedAlerts);
    }

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}

function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
