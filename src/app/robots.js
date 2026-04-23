export default function robots() {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/_next/',       // Blocks Google from trying to index Next.js code chunks
          '/api/',         // Blocks Google from indexing your raw API routes
          '/feed/',        // Blocks old WordPress RSS feeds
          '/wp-admin/',    // Extra layer of protection for your backend
          '/tag/',         // Blocks old WordPress tag archives
          '/category/'     // Blocks old WordPress category archives
        ],
      },
      // We can also drop your new sitemap URL right here so Google always knows where to find it!
      sitemap: 'https://fsan.com/sitemap.xml',
    }
  }