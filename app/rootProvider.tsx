// app/RootProvider.tsx dosyasının tam içeriği

'use client';

import { ReactNode } from 'react';
import { base } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { ThemeProvider } from 'next-themes'; // Karanlık mod için bu gerekli

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    // Önce ThemeProvider'ı (karanlık mod) ayarlıyoruz
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* Şimdi OnchainKitProvider'ı ayarlıyoruz.
        'MiniAppProvider' yerine bunu kullanıyoruz.
      */}
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} // API anahtarına ihtiyacın olacak
        chain={base}
        config={{
          appearance: {
            mode: 'auto',
          },
          wallet: {
            display: 'modal',
            preference: 'all',
          },
        }}
        // Mini app özelliklerini burada 'prop' olarak etkinleştiriyoruz
        miniKit={{
          enabled: true,
          autoConnect: true,
          notificationProxyUrl: undefined,
        }}
      >
        {children}
      </OnchainKitProvider>
    </ThemeProvider>
  );
}