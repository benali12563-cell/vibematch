import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tpplggcjrgdnprexgvny.supabase.co",
      },
    ],
  },
};

export default nextConfig;
