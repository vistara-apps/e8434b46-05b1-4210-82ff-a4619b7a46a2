import { NextRequest, NextResponse } from 'next/server';
import { AlertDatabase, MarketDataCache } from '@/lib/database';
import { fetchCryptoPrice } from '@/lib/api';
import { sendBrowserNotification } from '@/lib/utils';

// This endpoint will be called by a cron job or webhook to monitor prices
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get('secret');
    
    // Verify cron secret for security
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting price monitoring...');
    
    // Get all active alerts
    const activeAlerts = await AlertDatabase.findActiveAlerts();
    console.log(`Found ${activeAlerts.length} active alerts to monitor`);
    
    const triggeredAlerts = [];
    const processedSymbols = new Set<string>();
    
    for (const alert of activeAlerts) {
      // Skip if we already processed this symbol in this run
      if (processedSymbols.has(alert.cryptoSymbol)) {
        continue;
      }
      
      try {
        // Fetch current price
        const currentPrice = await fetchCryptoPrice(alert.cryptoSymbol);
        
        if (currentPrice === null) {
          console.warn(`Could not fetch price for ${alert.cryptoSymbol}`);
          continue;
        }
        
        processedSymbols.add(alert.cryptoSymbol);
        
        // Check if alert should be triggered
        let shouldTrigger = false;
        
        if (alert.alertType === 'price_target') {
          if (alert.direction === 'above' && currentPrice >= alert.thresholdValue) {
            shouldTrigger = true;
          } else if (alert.direction === 'below' && currentPrice <= alert.thresholdValue) {
            shouldTrigger = true;
          }
        }
        
        if (shouldTrigger) {
          // Update alert status
          await AlertDatabase.update(alert.alertId, {
            status: 'triggered',
            triggeredAt: new Date(),
          });
          
          // Send notification (this would be expanded to include Telegram)
          const message = `🚨 Price Alert Triggered!\n${alert.cryptoSymbol.toUpperCase()} has reached $${currentPrice.toLocaleString()}`;
          
          // For now, we'll just log the notification
          // In production, this would send actual notifications
          console.log(`Alert triggered for ${alert.userId}: ${message}`);
          
          triggeredAlerts.push({
            alertId: alert.alertId,
            userId: alert.userId,
            symbol: alert.cryptoSymbol,
            currentPrice,
            targetPrice: alert.thresholdValue,
            direction: alert.direction,
          });
        }
        
        // Cache the current price
        await MarketDataCache.set(alert.cryptoSymbol, {
          symbol: alert.cryptoSymbol,
          name: alert.cryptoSymbol.charAt(0).toUpperCase() + alert.cryptoSymbol.slice(1),
          price: currentPrice,
          priceChange24h: 0,
          priceChangePercentage24h: 0,
          marketCap: 0,
          volume24h: 0,
          timestamp: new Date(),
        }, 300); // Cache for 5 minutes
        
      } catch (error) {
        console.error(`Error processing alert ${alert.alertId}:`, error);
      }
    }
    
    console.log(`Price monitoring completed. Triggered ${triggeredAlerts.length} alerts.`);
    
    return NextResponse.json({
      success: true,
      monitored: activeAlerts.length,
      triggered: triggeredAlerts.length,
      alerts: triggeredAlerts,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in price monitoring:', error);
    return NextResponse.json(
      { error: 'Price monitoring failed' },
      { status: 500 }
    );
  }
}

// Manual trigger for testing
export async function GET(request: NextRequest) {
  try {
    // This is for testing purposes - in production you'd want authentication
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');
    
    if (test !== 'true') {
      return NextResponse.json(
        { error: 'This endpoint is for testing only' },
        { status: 400 }
      );
    }
    
    // Redirect to POST with test secret
    return NextResponse.redirect(
      new URL(`/api/price-monitor?secret=test`, request.url),
      { status: 307 }
    );
    
  } catch (error) {
    console.error('Error in price monitoring test:', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}
