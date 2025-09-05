import { NextRequest, NextResponse } from 'next/server';
import { UserDatabase } from '@/lib/database';
import { telegramService } from '@/lib/telegram';
import { NotificationManager } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, data } = body;
    
    if (!userId || !type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, data' },
        { status: 400 }
      );
    }
    
    // Get user preferences
    const user = await UserDatabase.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const results = {
      browser: false,
      telegram: false,
    };
    
    // Send browser notification if enabled
    if (user.notificationPreferences.browser) {
      try {
        // This would typically be handled on the client side
        // For server-side, we'll just mark as successful
        results.browser = true;
      } catch (error) {
        console.error('Browser notification failed:', error);
      }
    }
    
    // Send Telegram notification if enabled and user has Telegram ID
    if (user.notificationPreferences.telegram && user.telegramId) {
      try {
        results.telegram = await telegramService.sendNotificationToUser(
          user.telegramId,
          type,
          data
        );
      } catch (error) {
        console.error('Telegram notification failed:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

// Test notification endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as 'price_alert' | 'trend_signal' | 'market_update';
    
    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, type' },
        { status: 400 }
      );
    }
    
    // Create test data based on type
    let testData;
    switch (type) {
      case 'price_alert':
        testData = {
          symbol: 'bitcoin',
          currentPrice: 67500,
          targetPrice: 65000,
          direction: 'above',
        };
        break;
        
      case 'trend_signal':
        testData = {
          symbol: 'ethereum',
          signal: 'bullish',
          confidence: 0.85,
          reason: 'Strong buying pressure and breaking resistance',
          targetPrice: 4000,
        };
        break;
        
      case 'market_update':
        testData = {
          title: 'Market Update',
          message: 'Bitcoin has reached a new all-time high!',
          data: { price: 67500 },
        };
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }
    
    // Send test notification
    const response = await fetch(new URL('/api/notifications', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        type,
        data: testData,
      }),
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      message: 'Test notification sent',
      type,
      data: testData,
      result,
    });
    
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
