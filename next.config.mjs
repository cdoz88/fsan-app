/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Routes /home, /articles, /videos, /podcasts to the 'all' sport folder
      {
        source: '/:view(home|articles|videos|podcasts|rankings)',
        destination: '/all/:view',
      },
      // Routes direct article/video/podcast URLs to the 'all' sport folder
      {
        source: '/:view(articles|videos|podcasts)/:slug',
        destination: '/all/:view/:slug',
      }
    ];
  },
};

export default nextConfig;