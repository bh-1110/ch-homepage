import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {(phase: string) => import('next').NextConfig} */
const nextConfig = (phase) => ({
  output: phase === PHASE_DEVELOPMENT_SERVER ? undefined : 'export',
  images: {
    unoptimized: true
  },
  turbopack: {
    root: projectRoot
  }
});

export default nextConfig;
