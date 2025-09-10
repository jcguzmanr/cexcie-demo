import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Para monorepo: evita warnings y resuelve dependencias desde la raíz
  outputFileTracingRoot: path.join(__dirname, "../../"),
  eslint: {
    // Evita que ESLint bloquee el build en Vercel (los errores seguirán en dev)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
