import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'home';

  // Generate frame HTML based on action
  const frameHtml = generateFrameHtml(action);

  return new NextResponse(frameHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { untrustedData, trustedData } = body;

    // Validate frame interaction
    if (!untrustedData || !trustedData) {
      return NextResponse.json(
        { error: 'Invalid frame data' },
        { status: 400 }
      );
    }

    const buttonIndex = untrustedData.buttonIndex;
    const fid = untrustedData.fid; // Farcaster ID

    // Handle different button actions
    let nextAction = 'home';
    let message = '';

    switch (buttonIndex) {
      case 1:
        nextAction = 'create-alert';
        message = 'Create a new price alert';
        break;
      case 2:
        nextAction = 'view-alerts';
        message = 'View your active alerts';
        break;
      case 3:
        nextAction = 'market-stats';
        message = 'Check market statistics';
        break;
      case 4:
        nextAction = 'settings';
        message = 'Configure your settings';
        break;
      default:
        nextAction = 'home';
        message = 'Welcome to CryptoPulse Alerts';
    }

    // Generate response frame
    const responseHtml = generateFrameHtml(nextAction, message, fid);

    return new NextResponse(responseHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Frame POST error:', error);
    return NextResponse.json(
      { error: 'Frame processing failed' },
      { status: 500 }
    );
  }
}

function generateFrameHtml(action: string, message?: string, fid?: number): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  let title = 'CryptoPulse Alerts';
  let description = 'Never miss a crypto move. Get instant price alerts and trend signals.';
  let imageUrl = `${baseUrl}/api/frame/image?action=${action}`;
  let buttons = [];

  switch (action) {
    case 'home':
      title = 'CryptoPulse Alerts - Home';
      description = 'Your crypto alert dashboard';
      buttons = [
        'Create Alert',
        'View Alerts', 
        'Market Stats',
        'Settings'
      ];
      break;
      
    case 'create-alert':
      title = 'Create Price Alert';
      description = 'Set up a new cryptocurrency price alert';
      buttons = [
        'BTC Alert',
        'ETH Alert',
        'Custom Alert',
        'Back to Home'
      ];
      break;
      
    case 'view-alerts':
      title = 'Your Active Alerts';
      description = 'Manage your cryptocurrency alerts';
      buttons = [
        'Active Alerts',
        'Triggered Alerts',
        'Create New',
        'Back to Home'
      ];
      break;
      
    case 'market-stats':
      title = 'Market Statistics';
      description = 'Real-time cryptocurrency market data';
      buttons = [
        'Top Gainers',
        'Top Losers',
        'Trending',
        'Back to Home'
      ];
      break;
      
    case 'settings':
      title = 'Settings';
      description = 'Configure your notification preferences';
      buttons = [
        'Notifications',
        'Telegram Setup',
        'Subscription',
        'Back to Home'
      ];
      break;
  }

  const buttonElements = buttons.map((button, index) => 
    `<meta property="fc:frame:button:${index + 1}" content="${button}" />`
  ).join('\n    ');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    
    <!-- Farcaster Frame Meta Tags -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
    ${buttonElements}
    
    <!-- Base MiniApp Integration -->
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${baseUrl}" />
    
    ${message ? `<meta property="fc:frame:state" content="${encodeURIComponent(JSON.stringify({ message, fid }))}" />` : ''}
  </head>
  <body>
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
      <h1>${title}</h1>
      <p>${description}</p>
      ${message ? `<p style="color: #0066cc; font-weight: bold;">${message}</p>` : ''}
      <a href="${baseUrl}" style="margin-top: 20px; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">
        Open CryptoPulse Alerts
      </a>
    </div>
  </body>
</html>`;
}
