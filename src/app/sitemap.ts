
import { type MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://mystic-insights-g3d6e.web.app';
  
  // NOTE: For a complete sitemap, you would also fetch dynamic routes 
  // (like all user readings) from your database. This is a static sitemap.
  const staticRoutes = [
    '/', // Homepage
    '/login',
    '/signup',
    '/dashboard',
    '/new-reading',
    '/dream-interpretation',
    '/credits',
    '/profile',
  ];

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.includes('dashboard') || route.includes('reading') ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));
}
