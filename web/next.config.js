/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❗️ Danger: allows builds to pass even with TS errors
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // also ignore ESLint errors in dev/build
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

module.exports = nextConfig;
