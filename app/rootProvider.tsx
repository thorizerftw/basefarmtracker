'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// CÜZDAN BUTONLARI İÇİN BU GEREKLİ:
import { OnchainKitProvider } from '@coinbase/onchainkit'; 
// "NOT READY" SİNYALİ İÇİN BU GEREKLİ:
import { MiniKitProvider } from '@coinbase/onchainkit/minikit'; // 'K' harfi büyük
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

// Vercel build hatası ("No QueryClient") almamak için bunlar şart
const queryClient = new QueryClient();
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

export function RootProvider({ children }: { children: ReactNode }) {
  // Bu apiKey, OnchainKitProvider için gerekli
  const onchainKitApiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

  return (
    // NİHAİ ÇÖZÜM:
    // "Not Ready" sorununu çözmek için HER ŞEYİ 'MiniKitProvider' ile sarmalıyoruz.
    // Bu, "Not Authorized" hatasını da çözecek.
    <MiniKitProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Bu, senin cüzdan butonlarını vb. çalıştıran 
              ORİJİNAL 'OnchainKitProvider'ın.
            */}
            <OnchainKitProvider
              apiKey={onchainKitApiKey}
              chain={base}
              // wagmiConfig prop'u buna gerekmiyor çünkü zaten
              // bir üstte WagmiProvider var.
            >
              {children}
            </OnchainKitProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MiniKitProvider>
  );
}