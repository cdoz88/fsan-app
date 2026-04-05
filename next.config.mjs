/** @type {import('next').NextConfig} */
const nextConfig = {
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