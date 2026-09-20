import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    // Image uploads through server actions (logo, artist photo, gallery…).
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  // Native/dynamic server packages that should not be bundled.
  serverExternalPackages: ["mysql2"],
};

export default nextConfig;
