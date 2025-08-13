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
