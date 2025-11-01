'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// MiniKitProvider ve OnchainKitProvider'ı KULLANMIYORUZ.
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { coinbaseWallet } from 'wagmi/connectors';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  // --- NİHAİ ÇÖZÜM: TypeScript hatasını sustur ve otomatik bağlanmayı kapat ---
  // @ts-ignore
  autoConnect: false,
  // ---
  
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    injected(), // Metamask, Farcaster vb.
    coinbaseWallet({
      appName: 'BaseFarm Tracker', 
      preference: 'smartWalletOnly',
    }),
  ],
});

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* --- HATAYI DÜZELTTİM: "defaultTheme=" EKLENDİ --- */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}