/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.mapbox.com', 'maps.mapbox.com', 'api.mapbox.com', '*.tiles.mapbox.com', '*.mapbox.com'],
    unoptimized: true, // Disable image optimization if not needed
  },
  // Allow loading resources from Mapbox domains
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.mapbox.com *.mapbox.com:*",
              "connect-src 'self' *.mapbox.com *.mapbox.com:* data: blob:",
              "img-src 'self' data: blob: *.mapbox.com *.mapbox.com:*",
              "style-src 'self' 'unsafe-inline' *.mapbox.com",
              "worker-src blob:",
              "child-src blob: data:",
              "frame-src 'self' blob: data:"
            ].join('; ')
          }
        ]
      }
    ];
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
  // Environment variables that will be available on the client
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,
  },
  
  // Ensure source maps are generated in production for debugging
  productionBrowserSourceMaps: true,
  
  // Enable React Strict Mode
  reactStrictMode: true,
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