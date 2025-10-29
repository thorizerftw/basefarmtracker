import './globals.css'; 
import { RootProvider } from '@/app/rootProvider'; 
import type { Metadata } from 'next'; 
import { Inter, Source_Code_Pro } from 'next/font/google';

// minikitConfig'i import et (Doğru yol)
import { minikitConfig } from '../minikit.config'; 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

// === generateMetadata FONKSİYONU (Dökümana %100 Uyumlu) ===
export async function generateMetadata(): Promise<Metadata> {
  const miniapp = minikitConfig.miniapp; 
  
  return {
    title: miniapp.name,
    description: miniapp.description,
    other: {
      "fc:miniapp": JSON.stringify({ 
        version: miniapp.version,
        imageUrl: miniapp.heroImageUrl, // Döküman bunu istiyor
        button: {
          // === DÜZELTME: Dökümandaki gibi 'Join the...' ===
          title: `Join the ${miniapp.name}`, 
          // ============================================
          action: {
            name: `Launch ${miniapp.name}`, // Eylem adı aynı kalabilir
            url: miniapp.homeUrl // URL doğruydu
          },
        },
      }),
    },
  };
}
// ===================================

// RootLayout fonksiyonu aynı kalıyor
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceCodePro.variable}`}>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}

