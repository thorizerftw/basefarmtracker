import './globals.css'; 
import { RootProvider } from '@/app/rootProvider'; 
import type { Metadata } from 'next'; // <--- BU SATIR EKLENDİ
import { Inter, Source_Code_Pro } from 'next/font/google';

// === YENİ: minikitConfig'i import et ===
// ../ çünkü layout.tsx app klasörünün içinde, config ise dışında
import { minikitConfig } from '../minikit.config'; 
// ===================================

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

// === YENİ: generateMetadata FONKSİYONU ===
// Bu fonksiyon, base.dev'in aradığı meta etiketlerini oluşturur.
export async function generateMetadata(): Promise<Metadata> {
  // minikitConfig'deki miniapp nesnesini alıyoruz
  const miniapp = minikitConfig.miniapp; 
  
  return {
    // Normal title ve description
    title: miniapp.name,
    description: miniapp.description,
    
    // İşte base.dev'in aradığı AMINA KODUMUN META ETİKETİ:
    other: {
      "fc:miniapp": JSON.stringify({ 
        version: miniapp.version,
        // Hata mesajı bunu istiyordu: imageUrl
        // Bunu minikitConfig'deki heroImageUrl'den alıyoruz
        imageUrl: miniapp.heroImageUrl, 
        button: {
          title: `Launch ${miniapp.name}`, // Buton başlığı
          action: {
            name: `Launch ${miniapp.name}`, // Eylem adı
            url: `${miniapp.homeUrl}` // Tıklayınca gidilecek URL
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

// export const metadata = { ... } bloğunu sildik, çünkü artık generateMetadata var.

