'use client';

import { ReactNode } from 'react';
import { base } from 'wagmi/chains';
// SADECE BUNU KULLANIYORUZ:
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 'OnchainKitProvider' Wagmi'yi kendi içinde kurar,
// ama 'react-query' için buna hâlâ ihtiyacımız var (Vercel build hatası için).
const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  // .env.local dosyana NEXT_PUBLIC_ONCHAINKIT_API_KEY eklemiş olmalısın
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

  return (
    <QueryClientProvider client={queryClient}>
      <OnchainKitProvider
        apiKey={apiKey}
        chain={base}
        // BU AYARLAR ARKADAŞININ KODUNDAN ALINDI
        config={{
          appearance: {
            mode: 'auto', // Temayı otomat
          },
          wallet: {
            display: 'modal', // "Connect" butonuna basınca MODAL AÇ
            preference: 'all', // Metamask, CB Wallet hepsini göster
          },
        }}
        // "NOT READY" VE "NOT AUTHORIZED" SORUNUNUN ÇÖZÜMÜ
        miniKit={{
          enabled: true,
          autoConnect: true,
        }}
      >
        {children}
      </OnchainKitProvider>
    </QueryClientProvider>
  );
}