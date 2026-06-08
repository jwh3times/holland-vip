import type { NextConfig } from "next";
import path from "path";

// Security headers are delivered via public/_headers (served by Cloudflare Pages).
// next.config headers() does not apply to a static export, so it is intentionally omitted.
const nextConfig: NextConfig = {
  output: "export",
  basePath: "",
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
