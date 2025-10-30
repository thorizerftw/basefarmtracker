/** @type {import('next').NextConfig} */
const nextConfig = {
  // VERCEL HATA DÜZELTMESİ:
  // 'Module not found: Can't resolve '@react-native-async-storage/async-storage''
  // hatasını çözmek için.
  // Bu ayar, Next.js'e web build'i yaparken bu mobil paketi
  // görmezden gelmesini (boş bir modül ile değiştirmesini) söyler.
  webpack: (config, { isServer }) => {
    // Sadece client tarafı build'i için
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
