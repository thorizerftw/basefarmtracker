import './globals.css'; 
import { RootProvider } from '@/app/rootProvider'; 
// HATA BURADAYDI: 'Metadata' import'unu sildik, çünkü Vercel buna kızıyor.
// import type { Metadata } from 'next'; 
import { Inter, Source_Code_Pro } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

// 'export const metadata' hala burada kalabilir, Next.js bunu anlar.
export const metadata = {
  title: 'BaseFarm Tracker',
  description: 'Airdrop farm tracker mini-app',
};

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
        
        {/* Ethers.js kütüphanesi (Bu doğruydu) */}
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js" 
          defer 
        ></script>
      </body>
    </html>
  );
}
