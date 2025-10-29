import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/holland-vip",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
