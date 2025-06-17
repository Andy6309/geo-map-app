/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable production source maps
  productionBrowserSourceMaps: true,
  
  // Image optimization
  images: {
    domains: ['*'], // Add any specific image domains you use
  },
  
  // Enable SWC minification (faster builds)
  swcMinify: true,
  
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Webpack configuration
  webpack: (config) => {
    // This ensures environment variables are available in the browser
    config.plugins = config.plugins || [];
    return config;
  },
};

// For Vercel deployments
const isVercel = process.env.VERCEL === '1';

// Only enable the standalone output on Vercel
if (isVercel) {
  nextConfig.output = 'standalone';
}

export default nextConfig;