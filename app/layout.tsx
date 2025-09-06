import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoPulse Alerts',
  description: 'Never miss a crypto move. Get instant price alerts and trend signals.',
  keywords: 'crypto, alerts, price, notifications, trading, Base, MiniApp',
  authors: [{ name: 'CryptoPulse Team' }],
  openGraph: {
    title: 'CryptoPulse Alerts',
    description: 'Never miss a crypto move. Get instant price alerts and trend signals.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoPulse Alerts',
    description: 'Never miss a crypto move. Get instant price alerts and trend signals.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/pwa-manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
