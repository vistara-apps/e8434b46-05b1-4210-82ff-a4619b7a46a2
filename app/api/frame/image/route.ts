import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'home';

  // Generate SVG image based on action
  const svg = generateFrameImage(action);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}

function generateFrameImage(action: string): string {
  const width = 1200;
  const height = 630; // 1.91:1 aspect ratio for Farcaster frames

  let title = 'CryptoPulse Alerts';
  let subtitle = 'Never miss a crypto move';
  let icon = '🚨';
  let bgColor = '#1a1b23';
  let accentColor = '#3b82f6';

  switch (action) {
    case 'home':
      title = 'CryptoPulse Alerts';
      subtitle = 'Your crypto alert dashboard';
      icon = '🏠';
      break;
    case 'create-alert':
      title = 'Create Price Alert';
      subtitle = 'Set up a new cryptocurrency alert';
      icon = '➕';
      accentColor = '#10b981';
      break;
    case 'view-alerts':
      title = 'Your Active Alerts';
      subtitle = 'Manage your alerts';
      icon = '📋';
      accentColor = '#f59e0b';
      break;
    case 'market-stats':
      title = 'Market Statistics';
      subtitle = 'Real-time crypto data';
      icon = '📊';
      accentColor = '#8b5cf6';
      break;
    case 'settings':
      title = 'Settings';
      subtitle = 'Configure your preferences';
      icon = '⚙️';
      accentColor = '#6b7280';
      break;
  }

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f1419;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${accentColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>
  
  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="50" fill="${accentColor}" opacity="0.1"/>
  <circle cx="${width - 100}" cy="${height - 100}" r="80" fill="#60a5fa" opacity="0.1"/>
  
  <!-- Main content container -->
  <rect x="80" y="120" width="${width - 160}" height="${height - 240}" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  
  <!-- Icon -->
  <text x="150" y="220" font-family="Arial, sans-serif" font-size="60" fill="${accentColor}" filter="url(#glow)">${icon}</text>
  
  <!-- Title -->
  <text x="250" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">
    ${title}
  </text>
  
  <!-- Subtitle -->
  <text x="250" y="240" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af">
    ${subtitle}
  </text>
  
  <!-- CryptoPulse branding -->
  <text x="250" y="300" font-family="Arial, sans-serif" font-size="16" fill="${accentColor}" font-weight="600">
    CRYPTOPULSE ALERTS
  </text>
  
  <!-- Action indicators -->
  ${action !== 'home' ? `
  <rect x="250" y="320" width="200" height="30" rx="15" fill="url(#accentGradient)" opacity="0.8"/>
  <text x="350" y="340" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="600">
    ${action.toUpperCase().replace('-', ' ')}
  </text>
  ` : ''}
  
  <!-- Decorative crypto symbols -->
  <text x="${width - 200}" y="180" font-family="Arial, sans-serif" font-size="20" fill="#6b7280" opacity="0.6">₿</text>
  <text x="${width - 160}" y="220" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" opacity="0.4">Ξ</text>
  <text x="${width - 180}" y="260" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" opacity="0.3">◊</text>
  
  <!-- Bottom accent line -->
  <rect x="80" y="${height - 140}" width="${width - 160}" height="2" fill="url(#accentGradient)"/>
  
  <!-- Footer text -->
  <text x="${width / 2}" y="${height - 100}" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">
    Base MiniApp • Real-time Crypto Alerts • Multi-channel Notifications
  </text>
</svg>`.trim();
}
