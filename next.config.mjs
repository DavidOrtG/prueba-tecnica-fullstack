/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  experimental: {
    // Ensure Prisma client is properly bundled
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Prisma client is properly handled in server-side code
      config.externals = config.externals || [];
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

export default nextConfig;
