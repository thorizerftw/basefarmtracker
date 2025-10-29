'use client';

// OnchainKit ve MiniKit ile ilgili her şeyi sildik.
// Hataların kaynağı onlardı.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  // Sadece QueryClient'i tutuyoruz.
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}