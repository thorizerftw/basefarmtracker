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
  // Hatalı "autoConnect" ayarını buradan sildik.
  
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
    // --- NİHAİ ÇÖZÜM (WAGMI V2 İÇİN) ---
    // "Not Authorized" hatasını çözmek için 'reconnectOnMount'
    // özelliğini 'false' yapıyoruz.
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}