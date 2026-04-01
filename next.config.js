/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tpplggcjrgdnprexgvny.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
