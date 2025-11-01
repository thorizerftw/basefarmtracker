'use client';

// MinikitProvider (layout.tsx dosyasında) zaten
// WagmiProvider, QueryClientProvider ve OnchainKitProvider'ın
// tüm görevlerini yapıyor.
//
// Bu yüzden rootProvider'ın TEK GÖREVİ tema (dark mode)
// ayarını yapmaktır.
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}