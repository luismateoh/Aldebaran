// Import the next-pwa plugin
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,      // Enable SWC minification for improved performance
    compiler: {
        removeConsole: process.env.NODE_ENV !== "development", // Remove console.log in production
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
                pathname: '**',
            },
        ],
    },
    /* // Can be safely removed in newer versions of Next.js
     future: {

       // by default, if you customize webpack config, they switch back to version 4.
       // Looks like backward compatibility approach.
       webpack5: true,
     },
     webpack(config) {
       config.resolve.fallback = {

         // if you miss it, all the other options in fallback, specified
         // by next.js will be dropped.
         ...config.resolve.fallback,

         fs: false, // the solution
       };

       return config;
     },*/
// Configuration object tells the next-pwa plugin
}

const pwaConfig = {
    dest: "public", // Destination directory for the PWA files
    disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
    register: true, // Register the PWA service worker
    skipWaiting: true, // Skip waiting for service worker activation
};

// Export the combined configuration for Next.js with PWA support
export default withPWA(pwaConfig)(nextConfig);
