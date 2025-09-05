# CryptoPulse Alerts - Base MiniApp

Never miss a crypto move. Get instant price alerts and trend signals.

## Features

- **Real-time Price Alerts**: Set specific price targets and get notified instantly
- **Trend Prediction Signals**: AI-powered trend analysis with confidence scores
- **Multi-Channel Notifications**: Browser notifications and Telegram integration
- **Market Insights**: Comprehensive market data with interactive charts
- **Subscription Management**: Free and premium tiers with flexible pricing

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Base network integration via OnchainKit
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Notifications**: Browser API + Telegram Bot API
- **Data**: CoinGecko API for market data

## Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd cryptopulse-alerts
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: OnchainKit API key for Base integration
- `TELEGRAM_BOT_TOKEN`: Telegram bot token for notifications (optional)
- `COINGECKO_API_KEY`: CoinGecko API key for higher rate limits (optional)

## Architecture

### Frontend Components
- `Dashboard`: Main overview with stats and recent alerts
- `AlertsManager`: Full alert management interface
- `MarketStats`: Real-time market data display
- `AlertConfigForm`: Create/edit alert configuration
- `AlertListItem`: Individual alert display component
- `Settings`: User preferences and subscription management
- `WalletConnect`: Wallet connection and authentication
- `ErrorBoundary`: Production-ready error handling

### API Endpoints
- `GET/POST /api/market`: Real-time cryptocurrency market data
- `GET/POST/DELETE /api/alerts`: User alert management
- `POST /api/notifications`: Multi-channel notification system
- `GET/POST/PUT /api/auth`: Wallet-based user authentication
- `POST /api/webhooks/price-monitor`: Price monitoring webhook
- `GET/POST /api/frame`: Farcaster frame integration
- `GET /api/frame/image`: Dynamic frame image generation

### Data Flow
1. **Authentication**: Wallet-based user authentication with persistent sessions
2. **Market Data**: Real-time data from CoinGecko API with fallback support
3. **Alert Storage**: Redis-based storage with in-memory fallback for development
4. **Price Monitoring**: Webhook-based price monitoring with automatic alert triggering
5. **Notifications**: Multi-channel notifications (browser + Telegram)
6. **Frame Integration**: Full Farcaster frame support with dynamic images

### Business Model
- **Free Tier**: 3 alert slots, basic notifications
- **Premium Tier**: $5/month, unlimited alerts, advanced features
- **Pay-per-slot**: $0.50 per additional alert slot

### Security Features
- Input validation on all API endpoints
- Error boundaries for graceful error handling
- Environment variable protection
- Rate limiting support
- CORS configuration
- Wallet-based authentication

## Deployment

This app is designed to run as a Base MiniApp within the Farcaster ecosystem:

1. Deploy to Vercel/Netlify
2. Configure Base network settings
3. Set up Telegram bot (optional)
4. Add frame metadata for Farcaster integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
