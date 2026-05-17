/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer', 'passkit-generator', 'node-forge'],
  },
};

export default nextConfig;
