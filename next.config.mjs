import withPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add empty turbopack config to silence warning in dev mode
  // PWA build still uses webpack via --webpack flag
  turbopack: {},
  webpack: (config) => config,
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
});

export default pwaConfig(nextConfig);
