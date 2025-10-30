import './globals.css';
// OnchainKit'in ana stil dosyası (Tailwind'den sonra)
import '@coinbase/onchainkit/styles.css'; 
import { RootProvider } from '@/app/rootProvider'; 
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// minikit.config.ts'ten bilgileri al
import { minikitConfig } from '../minikit.config'; 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// === BU FONKSİYON base.dev'in GÖRSELİ GÖRMESİ İÇİN ŞART ===
export async function generateMetadata(): Promise<Metadata> {
  const miniapp = minikitConfig.miniapp;
  return {
    title: miniapp.name,
    description: miniapp.description,
    other: {
      // Bu 'fc:miniapp' etiketleri o dökümandaki (embeds-and-previews)
      // "Image Preview" sorununu çözen asıl şeydir.
      "fc:miniapp": JSON.stringify({
        version: miniapp.version,
        // Döküman 'imageUrl' olarak 'heroImageUrl'i istiyor
        imageUrl: miniapp.heroImageUrl, 
        button: {
          title: `Join the ${miniapp.name}`, // Dökümandaki "Join the..."
          action: {
            name: `Launch ${miniapp.name}`,
            url: `${miniapp.homeUrl}`,
          },
        },
      }),
    },
  };
}
// =======================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

