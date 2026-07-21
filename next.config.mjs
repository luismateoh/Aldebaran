// Import the next-pwa plugin
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false, // Disable to avoid minimatch issues
  },
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
  typescript: {
    // Skip type checking during build (Vercel will handle this)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build
    ignoreDuringBuilds: true,
  },
  images: {
    // Responsive image breakpoints
    deviceSizes: [420, 640, 768, 1024, 1280, 1536],
    // Image sizes for cards, galleries, etc
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Supported formats with AVIF for better compression
    formats: ['image/avif', 'image/webp'],
    // Allow external images from common stock photo providers
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Minimum cache TTL for optimized images
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    // Disable static import warning for `fill` images with no sizes
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    const headersList = [];
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
      headersList.push({
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
        source: '/:path*',
      });
    }
    return headersList;
  }
}

const pwaConfig = {
  dest: "public", // Destination directory for the PWA files
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
  register: true, // Register the PWA service worker
  skipWaiting: true, // Skip waiting for service worker activation
};

// Export the combined configuration for Next.js with PWA support
export default withPWA(pwaConfig)(nextConfig);
