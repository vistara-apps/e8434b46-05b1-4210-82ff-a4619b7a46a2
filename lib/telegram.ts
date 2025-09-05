// Telegram Bot API integration
export class TelegramBot {
  private botToken: string;
  private apiUrl: string;
  
  constructor(botToken?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }
  
  async sendMessage(
    chatId: string,
    text: string,
    options?: {
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disableWebPagePreview?: boolean;
      disableNotification?: boolean;
      replyMarkup?: any;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: options?.parseMode || 'HTML',
          disable_web_page_preview: options?.disableWebPagePreview || false,
          disable_notification: options?.disableNotification || false,
          reply_markup: options?.replyMarkup,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Telegram API error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }
  
  async sendPriceAlert(
    chatId: string,
    cryptoSymbol: string,
    currentPrice: number,
    targetPrice: number,
    direction: 'above' | 'below'
  ): Promise<boolean> {
    const emoji = direction === 'above' ? '🚀' : '📉';
    const directionText = direction === 'above' ? 'risen above' : 'fallen below';
    
    const message = `
${emoji} <b>Price Alert Triggered!</b>

<b>${cryptoSymbol.toUpperCase()}</b> has ${directionText} your target price.

💰 <b>Current Price:</b> $${currentPrice.toLocaleString()}
🎯 <b>Target Price:</b> $${targetPrice.toLocaleString()}
📊 <b>Direction:</b> ${direction.toUpperCase()}

<i>Alert triggered at ${new Date().toLocaleString()}</i>
    `.trim();
    
    return await this.sendMessage(chatId, message, {
      parseMode: 'HTML',
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: '📈 View Chart',
              url: `https://www.coingecko.com/en/coins/${cryptoSymbol}`,
            },
            {
              text: '⚙️ Manage Alerts',
              callback_data: `manage_alerts_${cryptoSymbol}`,
            },
          ],
        ],
      },
    });
  }
  
  async sendTrendSignal(
    chatId: string,
    cryptoSymbol: string,
    signal: 'bullish' | 'bearish',
    confidence: number,
    reason: string,
    targetPrice?: number
  ): Promise<boolean> {
    const emoji = signal === 'bullish' ? '📈' : '📉';
    const signalEmoji = signal === 'bullish' ? '🟢' : '🔴';
    
    const message = `
${emoji} <b>Trend Signal Detected!</b>

${signalEmoji} <b>${cryptoSymbol.toUpperCase()}</b> - ${signal.toUpperCase()} Signal

📊 <b>Confidence:</b> ${Math.round(confidence * 100)}%
💡 <b>Reason:</b> ${reason}
${targetPrice ? `🎯 <b>Target Price:</b> $${targetPrice.toLocaleString()}` : ''}

<i>Signal generated at ${new Date().toLocaleString()}</i>
    `.trim();
    
    return await this.sendMessage(chatId, message, {
      parseMode: 'HTML',
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: '📈 View Chart',
              url: `https://www.coingecko.com/en/coins/${cryptoSymbol}`,
            },
            {
              text: '🔔 Create Alert',
              callback_data: `create_alert_${cryptoSymbol}`,
            },
          ],
        ],
      },
    });
  }
  
  async sendMarketUpdate(
    chatId: string,
    title: string,
    message: string,
    data?: any
  ): Promise<boolean> {
    const formattedMessage = `
📊 <b>${title}</b>

${message}

<i>Update sent at ${new Date().toLocaleString()}</i>
    `.trim();
    
    return await this.sendMessage(chatId, formattedMessage, {
      parseMode: 'HTML',
    });
  }
  
  async validateChatId(chatId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/getChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error validating Telegram chat ID:', error);
      return false;
    }
  }
  
  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error setting Telegram webhook:', error);
      return false;
    }
  }
  
  async deleteWebhook(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/deleteWebhook`, {
        method: 'POST',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting Telegram webhook:', error);
      return false;
    }
  }
  
  async getMe(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/getMe`);
      
      if (response.ok) {
        const data = await response.json();
        return data.result;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting bot info:', error);
      return null;
    }
  }
}

// Telegram notification service
export class TelegramNotificationService {
  private bot: TelegramBot;
  
  constructor(botToken?: string) {
    this.bot = new TelegramBot(botToken);
  }
  
  async sendNotificationToUser(
    telegramId: string,
    type: 'price_alert' | 'trend_signal' | 'market_update',
    data: any
  ): Promise<boolean> {
    try {
      switch (type) {
        case 'price_alert':
          return await this.bot.sendPriceAlert(
            telegramId,
            data.symbol,
            data.currentPrice,
            data.targetPrice,
            data.direction
          );
          
        case 'trend_signal':
          return await this.bot.sendTrendSignal(
            telegramId,
            data.symbol,
            data.signal,
            data.confidence,
            data.reason,
            data.targetPrice
          );
          
        case 'market_update':
          return await this.bot.sendMarketUpdate(
            telegramId,
            data.title,
            data.message,
            data.data
          );
          
        default:
          console.error('Unknown notification type:', type);
          return false;
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }
  }
  
  async validateTelegramId(telegramId: string): Promise<boolean> {
    return await this.bot.validateChatId(telegramId);
  }
  
  async getBotInfo(): Promise<any> {
    return await this.bot.getMe();
  }
}

// Export singleton instance
export const telegramService = new TelegramNotificationService();
