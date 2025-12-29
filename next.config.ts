import {NextConfig} from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '1gb',
        },
        webpackMemoryOptimizations: true,
    },
    transpilePackages: ['react-map-gl'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'radar.weather.gov',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'utfs.io',
                port: '',
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;
