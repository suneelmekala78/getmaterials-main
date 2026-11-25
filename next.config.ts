import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set by the Dockerfile; Amplify builds keep the default output.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  // Allow CI/local `next build` alongside `next dev` without sharing `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["mongoose", "mongodb"],
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
