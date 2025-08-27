import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  // Configuración para resolver problemas de scripts en Next.js 15
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuración para el manejo de errores
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
