import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production-ready config for Hostinger Node.js deployment
  // Next.js will respect PORT env variable automatically
  // Standalone output optional for Hostinger - keeping default for simplicity
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
};

export default nextConfig;
