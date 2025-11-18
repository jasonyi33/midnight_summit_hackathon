/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      root: __dirname, // Explicitly set the root directory for Turbopack
    },
  },
};

module.exports = nextConfig;