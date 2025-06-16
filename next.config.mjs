/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            'api.mapbox.com',
            'a.tiles.mapbox.com',
            'b.tiles.mapbox.com',
            'api.tiles.mapbox.com',
            'events.mapbox.com',
            'www.mapbox.com',
            '*.tiles.mapbox.com',
            'maps.mapbox.com',
            '*.mapbox.com',
            '*.mapbox.net',
            'tiles.mapbox.com',
            'a.images.mapbox.com',
            'b.images.mapbox.com',
            'c.images.mapbox.com',
            'd.images.mapbox.com',
            'cdn.jsdelivr.net',
            'raw.githubusercontent.com'
        ],
        disableStaticImages: true,
        unoptimized: true,
    },
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
            dns: false,
            child_process: false,
            http2: false,
            process: false,
        };
        return config;
    },
    env: {
        NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    },
    productionBrowserSourceMaps: true,
    async headers() {
        return [
            {
                // Apply these headers to all routes
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.mapbox.com *.mapbox.net",
                            "style-src 'self' 'unsafe-inline' *.mapbox.com *.mapbox.net",
                            "img-src 'self' data: blob: *.mapbox.com *.mapbox.net",
                            "connect-src 'self' *.mapbox.com *.mapbox.net *.tiles.mapbox.com api.mapbox.com events.mapbox.com",
                            "frame-src 'self' *.mapbox.com",
                            "worker-src 'self' blob:",
                            "child-src 'self' blob:",
                            "font-src 'self' *.mapbox.com"
                        ].join('; ')
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, OPTIONS, HEAD',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-Requested-With, Content-Type, Authorization, Accept, Range',
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true',
                    },
                    {
                        key: 'Access-Control-Expose-Headers',
                        value: 'ETag, Content-Length, Content-Range',
                    },
                    {
                        key: 'Cross-Origin-Resource-Policy',
                        value: 'cross-origin',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // Specific CORS headers for Mapbox domains
            {
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
                ],
            },
            {
                source: '/(.*)\.(png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ];
    },
    // Disable static optimization for all pages
    output: 'standalone',
    // Enable React Strict Mode
    reactStrictMode: true,
    // Disable ETag generation
    generateEtags: false,
    // Disable x-powered-by header
    poweredByHeader: false,
    // Enable production source maps
    productionBrowserSourceMaps: true,
    // Disable static optimization for all pages
    experimental: {
        outputFileTracingRoot: path.join(__dirname, '../../'),
        outputFileTracingExcludes: {
            '*': [
                'node_modules/@swc/core-linux-x64-gnu',
                'node_modules/@swc/core-linux-x64-musl',
                'node_modules/@esbuild/linux-x64',
            ],
        },
        // Enable modern image format support
        optimizeCss: true,
        scrollRestoration: true,
        // Enable webpack 5
        webpack5: true,
    },
};

// Ensure the path module is available
import path from 'path';

export default nextConfig;