import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoPulse Alerts',
  description: 'Never miss a crypto move. Get instant price alerts and trend signals.',
  keywords: ['crypto', 'alerts', 'price', 'notifications', 'trading', 'base'],
  authors: [{ name: 'CryptoPulse Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1e40af',
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
