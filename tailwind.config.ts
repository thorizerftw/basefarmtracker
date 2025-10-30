import type { Config } from 'tailwindcss';

const config: Config = {
  // 'class' (HTML tag'ı) ile dark mode'u aç
  darkMode: 'class', 
  
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // OnchainKit'in stil dosyalarını okuması için bu yol ŞART
    './node_modules/@coinbase/onchainkit/**/*.{js,ts,jsx,tsx}', 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;

