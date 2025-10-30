import type { Config } from 'tailwindcss';

const config: Config = {
  // 'class' (HTML tag'ı) ile dark mode'u aç
  darkMode: 'class', 
  
  content: [
    // DOSYA YOLU DÜZELTMESİ:
    // Projen 'src' klasörü kullanmıyor, bu yüzden 'src/' kaldırıldı.
    './app/**/*.{js,ts,jsx,tsx,mdx}', 
    
    // Varsa diye 'pages' ve 'components' için de düzeltme
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    // OnchainKit'in stil dosyalarını okuması için bu yol ŞART
    './node_modules/@coinbase/onchainkit/**/*.{js,ts,jsx,tsx}', 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;

