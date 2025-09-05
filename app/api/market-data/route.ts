import { NextRequest, NextResponse } from 'next/server';
import { MarketDataCache } from '@/lib/database';
import { fetchMarketData, fetchCryptoPrice } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const symbols = searchParams.get('symbols')?.split(',');
    
    if (symbol) {
      // Get single cryptocurrency data
      let marketData = await MarketDataCache.get(symbol);
      
      if (!marketData) {
        // Fetch fresh data if not in cache
        const price = await fetchCryptoPrice(symbol);
        if (!price) {
          return NextResponse.json(
            { error: 'Cryptocurrency not found' },
            { status: 404 }
          );
        }
        
        // For single symbol requests, we'll create a basic market data object
        marketData = {
          symbol,
          name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
          price,
          priceChange24h: 0,
          priceChangePercentage24h: 0,
          marketCap: 0,
          volume24h: 0,
          timestamp: new Date(),
        };
        
        // Cache for 1 minute
        await MarketDataCache.set(symbol, marketData, 60);
      }
      
      return NextResponse.json(marketData);
    } else if (symbols && symbols.length > 0) {
      // Get multiple cryptocurrencies data
      let marketDataArray = await MarketDataCache.getMultiple(symbols);
      
      // If we don't have all symbols in cache, fetch fresh data
      if (marketDataArray.length < symbols.length) {
        const freshData = await fetchMarketData();
        const filteredData = freshData.filter(data => symbols.includes(data.symbol));
        
        if (filteredData.length > 0) {
          await MarketDataCache.setMultiple(filteredData, 60);
          marketDataArray = filteredData;
        }
      }
      
      return NextResponse.json(marketDataArray);
    } else {
      // Get all supported cryptocurrencies
      let marketDataArray = await MarketDataCache.getMultiple([
        'bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin'
      ]);
      
      // If cache is empty or incomplete, fetch fresh data
      if (marketDataArray.length === 0) {
        marketDataArray = await fetchMarketData();
        if (marketDataArray.length > 0) {
          await MarketDataCache.setMultiple(marketDataArray, 60);
        }
      }
      
      return NextResponse.json(marketDataArray);
    }
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'refresh') {
      // Force refresh market data
      const freshData = await fetchMarketData();
      
      if (freshData.length > 0) {
        await MarketDataCache.setMultiple(freshData, 60);
      }
      
      return NextResponse.json({ 
        message: 'Market data refreshed successfully',
        count: freshData.length,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: refresh' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error refreshing market data:', error);
    return NextResponse.json(
      { error: 'Failed to refresh market data' },
      { status: 500 }
    );
  }
}
