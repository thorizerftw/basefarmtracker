import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // <-- 1. Global CSS dosyasını (yukarıdaki) import ediyoruz.
import { RootProvider } from './rootProvider'; // <-- 2. rootProvider'ı (wallet/tema) import ediyoruz.

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BaseFarm Tracker',
  description: 'Personal Airdrop Checklist',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 'suppressHydrationWarning' uyarısını eklemek, next-themes için iyi bir pratiktir.
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 3. Tüm uygulamayı (children) RootProvider ile sarmalıyoruz. */}
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
