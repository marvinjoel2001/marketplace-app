import type { MetadataRoute } from 'next';

// Catalog pages are public; accounts, orders, checkout and the store/admin panels are not for search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/vendor', '/cuenta', '/pedido', '/checkout', '/cart', '/api'],
    },
  };
}
