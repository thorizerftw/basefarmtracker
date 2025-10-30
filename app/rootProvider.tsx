'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

// Wagmi ve OnchainKit için config ayarları
// (package.json'daki ^2.x sürümleriyle uyumlu)
const queryClient = new QueryClient();
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

export function RootProvider({ children }: { children: ReactNode }) {
  // .env.local dosyana NEXT_PUBLIC_ONCHAINKIT_API_KEY ekleyebilirsin
  // Şimdilik API Key olmadan da çalışır
  const onchainKitApiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/*
          Tema (dark mode) ve cüzdan sağlayıcılarını (OnchainKit) burada kuruyoruz.
          'ConnectButton' bileşeni bu sağlayıcılara ihtiyaç duyar.
        */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <OnchainKitProvider
            apiKey={onchainKitApiKey}
            chain={base}
            // wagmiConfig={wagmiConfig} // v2'de buna gerek yok, WagmiProvider'dan alıyor
          >
            {children}
          </OnchainKitProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}