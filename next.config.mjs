/** @type {import('next').NextConfig} */
const nextConfig = {
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
      },
      // NEW: Catch-all redirect for your old WordPress article URLs!
      // The Regex safely ignores your actual app pages and static files to prevent breaking the site.
      {
        source: '/:slug((?!api|football|basketball|baseball|all|subscribe|scores|reset-password|player|admin|account|rankings|login)[a-zA-Z0-9-]+)',
        destination: '/football/articles/:slug',
        permanent: true,
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