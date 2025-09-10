import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    // Para monorepo: evita warnings y resuelve dependencias desde la raíz
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};

export default nextConfig;
