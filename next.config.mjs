/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['s.gravatar.com'],
    },
    experimental: {
        instrumentationHook: true,
    },
    transpilePackages: ['executable-workflows'],
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    redirects: async () => {
        return [
            {
                source: '/',
                destination: '/app',
                permanent: true,
            },
        ];
    }
};

export default nextConfig;
