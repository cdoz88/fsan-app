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
      // FIX: Added 'stream-dashboard' and 'stream-remote' to the protected regex list
      {
        source: '/:slug((?!api|football|basketball|baseball|all|subscribe|scores|reset-password|player|admin|account|rankings|login|home|articles|videos|podcasts|search|teams|dno|dashboard|agreement|feed|boom-bust|stream-dashboard|stream-remote)[a-zA-Z0-9-]+)',
        destination: '/football/articles/:slug',
        permanent: true,
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:view(home|articles|videos|podcasts|rankings|search)',
        destination: '/all/:view',
      },
      {
        source: '/:view(articles|videos|podcasts|search)/:slug',
        destination: '/all/:view/:slug',
      }
    ];
  },
};

export default nextConfig;