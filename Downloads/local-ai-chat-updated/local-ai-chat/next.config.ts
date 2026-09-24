import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip buffers streamed responses; this is a local app, so skip it.
  compress: false,
  serverExternalPackages: ["unpdf", "better-sqlite3"],
};

export default nextConfig;
