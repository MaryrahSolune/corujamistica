
import { type MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://mystic-insights-g3d6e.web.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Do not index admin pages
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
