/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❗️ Danger: allows builds to pass even with TS errors
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // also ignore ESLint errors in dev/build
    ignoreDuringBuilds: true,
    // Exclude specific files from ESLint checks
    dirs: [
      'src', 
      'pages', 
      'app', 
      'components'
    ],
    exclude: [
      '**/src/hooks/useGameData.ts',
      '**/src/hooks/__tests__/openingPipeline.test.ts'
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

module.exports = nextConfig;
