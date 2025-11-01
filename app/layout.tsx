import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// RootProvider'ı import et
import { RootProvider } from './rootProvider';

// "IMAGE PREVIEW" İÇİN GEREKLİ METADATA KODU (Bu kalıyor):
const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "BaseFarm Tracker",
    description: "A personal and private airdrop farming checklist. Track your tasks, deadlines, and priorities for multiple projects, all locked to your crypto wallet.",
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `${ROOT_URL}/basedroptracker-hero.png`,
        button: {
          title: `Launch BaseFarm Tracker`,
          action: {
            name: `Launch BaseFarm Tracker`,
            url: ROOT_URL
          },
        },
      }),
    },
  };
}
// METADATA KODU BİTTİ

const inter = Inter({ subsets: ['latin'] });

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
          MinikitProvider'ı buradan kaldırdık. 
          Tüm sağlayıcılar artık rootProvider'da.
        */}
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}