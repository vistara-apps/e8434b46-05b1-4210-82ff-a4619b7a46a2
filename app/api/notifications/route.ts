import { NextRequest, NextResponse } from 'next/server';

interface NotificationRequest {
  userId: string;
  title: string;
  message: string;
  channels: ('browser' | 'telegram')[];
  telegramChatId?: string;
  alertId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json();
    const { userId, title, message, channels, telegramChatId, alertId } = body;

    if (!userId || !title || !message || !channels?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required notification fields' },
        { status: 400 }
      );
    }

    const results: { channel: string; success: boolean; error?: string }[] = [];

    // Send browser notification (handled client-side)
    if (channels.includes('browser')) {
      results.push({
        channel: 'browser',
        success: true,
      });
    }

    // Send Telegram notification
    if (channels.includes('telegram') && telegramChatId) {
      try {
        const telegramResult = await sendTelegramNotification(telegramChatId, title, message);
        results.push({
          channel: 'telegram',
          success: telegramResult.success,
          error: telegramResult.error,
        });
      } catch (error) {
        results.push({
          channel: 'telegram',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log notification for analytics
    console.log(`Notification sent to user ${userId}:`, {
      title,
      message,
      channels,
      alertId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        results,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

async function sendTelegramNotification(
  chatId: string,
  title: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    return {
      success: false,
      error: 'Telegram bot token not configured',
    };
  }

  try {
    const telegramMessage = `🚨 *${title}*\n\n${message}`;
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.description || 'Telegram API error');
    }

    return { success: true };

  } catch (error) {
    console.error('Telegram notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// GET endpoint to test notification setup
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get('test');

  if (test === 'telegram') {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json({
        success: false,
        error: 'Telegram bot token not configured',
        setup: 'Add TELEGRAM_BOT_TOKEN to your environment variables',
      });
    }

    try {
      // Test bot connection
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const result = await response.json();

      if (response.ok) {
        return NextResponse.json({
          success: true,
          bot: result.result,
          message: 'Telegram bot is configured correctly',
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.description || 'Invalid bot token',
        });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Telegram API',
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Notifications API is running',
    endpoints: {
      'POST /api/notifications': 'Send notification',
      'GET /api/notifications?test=telegram': 'Test Telegram bot setup',
    },
  });
}
