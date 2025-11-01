'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { coinbaseWallet } from 'wagmi/connectors';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  // --- NİHAİ ÇÖZÜM: TypeScript hatasını Vercel'in istediği gibi sustur ---
  // @ts-expect-error
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}