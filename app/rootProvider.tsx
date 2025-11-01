'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// "OnchainKitProvider" YERİNE "MinikitProvider" KULLANIYORUZ:
import { MinikitProvider } from '@coinbase/onchainkit/minikit'; 
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

// Wagmi ve QueryClient config'lerini GERİ GETİRDİK
const queryClient = new QueryClient();
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

export function RootProvider({ children }: { children: ReactNode }) {
  // apiKey'e provider seviyesinde ihtiyaç yokmuş.
  // const onchainKitApiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

  return (
    // SİLDİĞİMİZ SAĞLAYICILARI GERİ GETİRDİK
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/*
            HATA VEREN "apiKey" SATIRINI SİLDİK.
            Bu, hem "Not Ready" hem de "No QueryClient" sorununu çözecek.
          */}
          <MinikitProvider
            chain={base}
            wagmiConfig={wagmiConfig} // Config'i buraya veriyoruz
          >
            {children}
          </MinikitProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}