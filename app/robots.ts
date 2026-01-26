import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/service-provider-dashboard/',
      '/auth/',] // Don't let Google scan private dashboards
    },
sitemap: 'https://truvouch.app/sitemap.xml',
  }
}