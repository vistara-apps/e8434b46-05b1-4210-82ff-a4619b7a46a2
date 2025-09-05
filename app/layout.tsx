import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { UserProvider } from '@/lib/contexts/UserContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoPulse Alerts',
  description: 'Never miss a crypto move. Get instant price alerts and trend signals.',
  keywords: ['crypto', 'alerts', 'price', 'notifications', 'trading', 'base'],
  authors: [{ name: 'CryptoPulse Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1e40af',
  openGraph: {
    title: 'CryptoPulse Alerts',
    description: 'Never miss a crypto move. Get instant price alerts and trend signals.',
    type: 'website',
    images: [
      {
        url: '/api/frame/image?action=home',
        width: 1200,
        height: 630,
        alt: 'CryptoPulse Alerts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoPulse Alerts',
    description: 'Never miss a crypto move. Get instant price alerts and trend signals.',
    images: ['/api/frame/image?action=home'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/api/frame/image?action=home',
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:post_url': '/api/frame',
    'fc:frame:button:1': 'Open App',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <UserProvider>
            {children}
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
