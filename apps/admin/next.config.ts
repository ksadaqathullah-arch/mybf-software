import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'],
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
};

export default nextConfig;
