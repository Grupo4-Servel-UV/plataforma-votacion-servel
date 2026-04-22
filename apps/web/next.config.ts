import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@servel/contracts'],

  // TODO: revisar
  // Opcional pero recomendado: Redirigir llamadas API a NestJS
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },
};

export default nextConfig;
