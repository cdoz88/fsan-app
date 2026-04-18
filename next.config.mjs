/** @type {import('next').NextConfig} */
const nextConfig = {
  // FIX: Bypass Vercel's strict image optimization limits and whitelist your external image sources!
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'admin.fsan.com' },
      { protocol: 'https', hostname: 'a.espncdn.com' },
      { protocol: 'https', hostname: 's.yimg.com' },
      { protocol: 'https', hostname: 'placehold.co' }
    ],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: 'https://admin.fsan.com/login',
        permanent: true,
      },
      {
        source: '/:sport(football|basketball|baseball|all)',
        destination: '/:sport/home',
        permanent: false,
      }
    ];
  },
  async rewrites() {
    return [
      // Routes /home, /articles, /videos, /podcasts, /rankings, /search to the 'all' sport folder
      {
        source: '/:view(home|articles|videos|podcasts|rankings|search)',
        destination: '/all/:view',
      },
      // Routes direct article/video/podcast URLs to the 'all' sport folder
      {
        source: '/:view(articles|videos|podcasts|search)/:slug',
        destination: '/all/:view/:slug',
      }
    ];
  },
};

export default nextConfig;