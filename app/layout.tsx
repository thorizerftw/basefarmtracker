import './globals.css'; 
import { RootProvider } from '@/app/rootProvider'; 
import type { Metadata } from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

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
        
        {/*
          İŞTE YENİ SATIR BU:
          Bu, MetaMask/Coinbase'e bağlanmak için gereken 'ethers' kütüphanesini yükler.
        */}
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js" 
          defer 
        ></script>
      </body>
    </html>
  );
}