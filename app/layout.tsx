import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// RootProvider'ı import et
import { RootProvider } from './rootProvider';
// "NOT READY" SORUNUNU ÇÖZMEK İÇİN DOĞRU İSİM:
import { MiniKitProvider } from '@coinbase/onchainkit/minikit'; // <-- BURAYI DÜZELTTİM

const inter = Inter({ subsets: ['latin'] });

// --- SENİN BİLGİLERİNİ BURAYA ELLE GİRDİM ---

// Vercel URL'sini almak için config dosyasındaki kodun aynısı:
// Resim linkleri buna ihtiyaç duyduğu için bunu eklemek zorundayız.
const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  return {
    // Bilgileri config'den okumak yerine direkt yazdım:
    title: "BaseFarm Tracker",
    description: "A personal and private airdrop farming checklist. Track your tasks, deadlines, and priorities for multiple projects, all locked to your crypto wallet.",
    
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `${ROOT_URL}/basedroptracker-hero.png`, // Resim linkini oluşturdum
        button: {
          title: `Personal Airdrop Checklist`, // Proje adını direkt yazdım
          action: {
            name: `BaseFarm Tracker`, // Proje adını direkt yazdım
            url: ROOT_URL // Ana sayfa linkini direkt verdim
          },
        },
      }),
    },
  };
}
// --- ELLE GİRDİĞİM BÖLÜM BİTTİ ---

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 'suppressHydrationWarning' next-themes için önemlidir
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/*
          Tüm siteyi 'RootProvider' ve "NOT READY" için 'MinikitProvider' ile sarmalıyoruz.
        */}
        <MiniKitProvider> {/* <-- BURAYI DA DÜZELTTİM */}
          <RootProvider>{children}</RootProvider>
        </MiniKitProvider>
      </body>
    </html>
  );
}