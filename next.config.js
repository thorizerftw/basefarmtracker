/** @type {import('next').NextConfig} */
const nextConfig = {
  // 3. Hata (Module not found) için çözüm:
  // Webpack'e bu paketleri web build'ine dahil etmemesini söylüyoruz.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false, // MetaMask SDK hatası için
        'pino-pretty': false, // WalletConnect (pino) hatası için
      };
    }
    return config;
  },
};

module.exports = nextConfig;

