'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// MiniKitProvider ve OnchainKitProvider SİLİNDİ (çünkü page.tsx ile savaşıyorlardı)
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { coinbaseWallet } from 'wagmi/connectors';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

// Vercel build hatası ("No QueryClient") almamak için bu şart
const queryClient = new QueryClient();

// Cüzdan seçebilmek için bu connector ayarları şart
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    injected(), // Metamask, Farcaster (Warpcast) vb. tarayıcı cüzdanları
    coinbaseWallet({
      appName: 'BaseFarm Tracker', 
      preference: 'smartWalletOnly',
    }),
  ],
});

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    // Artık 'Ready' sinyali veya 'eth_accounts' isteği yok.
    // Sadece altyapıyı sağlıyoruz.
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}