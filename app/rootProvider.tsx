'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit'; 
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
// --- SENİN İSTEĞİN ÜZERİNE CONNECTOR'LARI İMPORT EDİYORUZ ---
import { injected } from 'wagmi/connectors';
import { coinbaseWallet } from 'wagmi/connectors';
// ---
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

// Vercel build hatası ("No QueryClient") almamak için bunlar şart
const queryClient = new QueryClient();

// --- WAGMI CONFIG'İ GÜNCELLİYORUZ ---
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  // "Sadece Metamask algılıyor" sorununu çözmek için
  // connector'ları (cüzdanları) elle belirliyoruz:
  connectors: [
    injected(), // Metamask, Farcaster (Warpcast) vb. tarayıcı cüzdanları
    coinbaseWallet({
      appName: 'BaseFarm Tracker', // Coinbase Wallet'ta görünecek ad
      preference: 'smartWalletOnly', // Mini-app'ler için bu önerilir
    }),
  ],
});
// --- GÜNCELLEME BİTTİ ---

export function RootProvider({ children }: { children: ReactNode }) {
  // Bu apiKey, OnchainKitProvider için gerekli
  const onchainKitApiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

  return (
    // "Not Ready" sinyali için en dışta
    <MiniKitProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Cüzdan butonlarının çalışması için içeride */}
            <OnchainKitProvider
              apiKey={onchainKitApiKey}
              chain={base}
            >
              {children}
            </OnchainKitProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MiniKitProvider>
  );
}