/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  // Deshabilitar SWC completamente
  experimental: {
    forceSwcTransforms: false,
  },
}

module.exports = nextConfig

