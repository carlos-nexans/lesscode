/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['s.gravatar.com'],
    },
    experimental: {
        instrumentationHook: true,
    },
};

export default nextConfig;
