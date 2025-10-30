import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// RootProvider'ı import et
import { RootProvider } from './rootProvider'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BaseFarm Tracker',
  description: 'A personal airdrop checklist mini-app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 'suppressHydrationWarning' next-themes için önemlidir
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/*
          Tüm siteyi 'RootProvider' ile sarmalıyoruz.
          Bu, 'ConnectButton'un çalışması için şarttır.
        */}
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}