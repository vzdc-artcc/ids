import config from './package.json' with {type: 'json'};
import {NextConfig} from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '1gb',
        },
    },
    publicRuntimeConfig: {
        version: config.version,
        author: config.author,
    },
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
