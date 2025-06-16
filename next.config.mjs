/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.mapbox.com', 'maps.mapbox.com'],
    unoptimized: true, // Disable image optimization if not needed
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },
  // Add base path if your app is served from a subdirectory
  // basePath: '/your-base-path', // Uncomment and set this if your app is served from a subdirectory
  // Enable production source maps for better error tracking
  productionBrowserSourceMaps: true,
  // Configure assetPrefix for static exports if needed
  // assetPrefix: './', // Uncomment this if you're doing a static export
};

// Only enable the assetPrefix in production
if (process.env.NODE_ENV === 'production') {
  // If you're deploying to a custom domain, you don't need to set assetPrefix
  // If deploying to a subdirectory, uncomment the following line:
  // nextConfig.assetPrefix = './';
}

export default nextConfig;