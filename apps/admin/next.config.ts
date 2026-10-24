import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'],
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  webpack: (config) => {
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      ...(config.resolve.modules || ['node_modules']),
    ];
    return config;
  },
};

export default nextConfig;
