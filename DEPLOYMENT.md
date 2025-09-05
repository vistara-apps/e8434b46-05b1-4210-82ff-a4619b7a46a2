# CryptoPulse Alerts - Production Deployment Guide

This guide covers the complete deployment process for CryptoPulse Alerts as a production-ready Base MiniApp.

## Prerequisites

- Node.js 18+ and npm
- Vercel account (recommended) or similar hosting platform
- Base network wallet for testing
- Optional: Telegram Bot, CoinGecko API key, Upstash Redis

## Environment Variables

### Required Variables

```bash
# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NODE_ENV=production

# OnchainKit API Key (Required for Base integration)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
```

### Optional Variables (Recommended for Production)

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# CoinGecko API Key (for higher rate limits)
COINGECKO_API_KEY=your_coingecko_api_key_here

# Redis Configuration (for persistent storage)
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# Wallet Connect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

## Deployment Steps

### 1. Vercel Deployment (Recommended)

1. **Fork/Clone the Repository**
   ```bash
   git clone <repository-url>
   cd cryptopulse-alerts
   npm install
   ```

2. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all required environment variables
   - Deploy: `vercel --prod`

### 2. Manual Deployment

1. **Build the Application**
   ```bash
   npm run build
   npm start
   ```

2. **Configure Reverse Proxy** (if using custom server)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Service Configuration

### 1. OnchainKit Setup

1. Visit [OnchainKit Dashboard](https://onchainkit.coinbase.com/)
2. Create a new project
3. Get your API key
4. Add to environment variables

### 2. Telegram Bot Setup (Optional)

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot: `/newbot`
3. Get your bot token
4. Add to environment variables
5. Test: `GET /api/notifications?test=telegram`

### 3. CoinGecko API Setup (Optional)

1. Visit [CoinGecko API](https://www.coingecko.com/en/api)
2. Sign up for a free account
3. Get your API key
4. Add to environment variables

### 4. Upstash Redis Setup (Optional but Recommended)

1. Visit [Upstash](https://upstash.com/)
2. Create a new Redis database
3. Get your REST URL and token
4. Add to environment variables

## Farcaster Frame Integration

### 1. Frame Metadata

The app automatically includes Farcaster frame metadata in the HTML head:

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="/api/frame/image?action=home" />
<meta property="fc:frame:post_url" content="/api/frame" />
```

### 2. Frame Endpoints

- **Frame Handler**: `/api/frame`
- **Frame Images**: `/api/frame/image`
- **Direct Access**: `/frame` (redirects to `/api/frame`)

### 3. Testing Frames

1. Use [Frame Validator](https://warpcast.com/~/developers/frames)
2. Enter your domain URL
3. Test frame interactions

## Base MiniApp Integration

### 1. MiniKit Configuration

The app uses OnchainKit's MiniKit for Base integration:

```typescript
import { useMiniKit } from '@coinbase/onchainkit/minikit';

// Initialize in your main component
const { setFrameReady } = useMiniKit();
useEffect(() => {
  setFrameReady();
}, [setFrameReady]);
```

### 2. Wallet Integration

- Supports multiple wallet connectors
- Auto-authentication on wallet connection
- Persistent user sessions

## Monitoring & Analytics

### 1. Error Monitoring

The app includes comprehensive error handling:

- Error boundaries for React components
- API error logging
- Production error reporting (ready for Sentry integration)

### 2. Performance Monitoring

- API response caching
- Image optimization
- Bundle size optimization

## Security Considerations

### 1. API Security

- Input validation on all endpoints
- Rate limiting (configurable)
- CORS configuration
- Environment variable protection

### 2. User Data

- Wallet-based authentication
- Optional data storage
- Privacy-focused design

## Testing

### 1. Local Testing

```bash
npm run dev
# Test at http://localhost:3000
```

### 2. Production Testing

```bash
# Test API endpoints
curl https://your-domain.com/api/market
curl https://your-domain.com/api/notifications?test=telegram

# Test frame
curl https://your-domain.com/api/frame
```

## Troubleshooting

### Common Issues

1. **Frame not loading**: Check frame metadata and image URLs
2. **API errors**: Verify environment variables
3. **Wallet connection issues**: Check OnchainKit configuration
4. **Notification failures**: Verify Telegram bot token

### Debug Mode

Set `NODE_ENV=development` to enable:
- Detailed error messages
- Console logging
- Development tools

## Scaling Considerations

### 1. Database

- Start with Redis for caching and sessions
- Consider PostgreSQL for complex queries
- Implement proper indexing for user alerts

### 2. Background Jobs

- Implement price monitoring workers
- Use queue systems for notifications
- Consider serverless functions for periodic tasks

### 3. CDN & Caching

- Use Vercel's edge network
- Implement proper cache headers
- Optimize static assets

## Support

For deployment issues:

1. Check the [GitHub Issues](repository-issues-url)
2. Review the [Documentation](README.md)
3. Test with the provided API endpoints

## Production Checklist

- [ ] Environment variables configured
- [ ] OnchainKit API key added
- [ ] Domain configured and SSL enabled
- [ ] Frame metadata tested
- [ ] Wallet connection working
- [ ] API endpoints responding
- [ ] Error monitoring setup
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Backup strategy implemented

Your CryptoPulse Alerts app is now ready for production! 🚀
