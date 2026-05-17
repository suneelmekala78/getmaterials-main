import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@getmaterials/ui", "@getmaterials/shared", "@getmaterials/database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "media.getmaterials.in" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
