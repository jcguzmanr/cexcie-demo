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
  async redirects() {
    return [
      { source: '/campus', destination: '/uc/campus', permanent: true },
      { source: '/modalidad', destination: '/uc/modalidad', permanent: true },
      { source: '/facultades', destination: '/uc/facultades', permanent: true },
      { source: '/carreras', destination: '/uc/carreras', permanent: true },
      { source: '/comparador', destination: '/uc/comparador', permanent: true },
      { source: '/carrera/:id', destination: '/uc/carrera/:id', permanent: true },
    ];
  },
};

export default nextConfig;
