/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // onchainkit'in mobil bağımlılıklarını ve
    // pino-pretty loglama aracını build'den hariç tut
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };
    return config;
  },
};

module.exports = nextConfig;

