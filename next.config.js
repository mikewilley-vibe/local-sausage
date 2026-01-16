/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
  turbopack: {
    root: process.cwd(),
  },
};

module.exports = nextConfig;
