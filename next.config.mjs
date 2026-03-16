/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add empty turbopack config to silence warning in dev mode
  turbopack: {},
  webpack: (config) => config,
};

export default nextConfig;
