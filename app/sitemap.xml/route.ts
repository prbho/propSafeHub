import { NextRequest, NextResponse } from 'next/server'

// Static routes for the sitemap
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/about', priority: '0.9', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'weekly' },
  { path: '/services/verification', priority: '0.8', changefreq: 'weekly' },
  { path: '/services/advisory', priority: '0.8', changefreq: 'weekly' },
  { path: '/services/diaspora', priority: '0.8', changefreq: 'weekly' },
  { path: '/services/mortgage', priority: '0.8', changefreq: 'weekly' },
  { path: '/services/construction', priority: '0.8', changefreq: 'weekly' },
  { path: '/properties', priority: '0.9', changefreq: 'daily' },
  { path: '/buy', priority: '0.8', changefreq: 'daily' },
  { path: '/rent', priority: '0.8', changefreq: 'daily' },
  { path: '/sell', priority: '0.8', changefreq: 'daily' },
  { path: '/agents', priority: '0.7', changefreq: 'weekly' },
  { path: '/become-agent', priority: '0.6', changefreq: 'monthly' },
  { path: '/faqs', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/schedule-meeting', priority: '0.7', changefreq: 'monthly' },
  { path: '/list-property', priority: '0.7', changefreq: 'monthly' },
  { path: '/list-property/sale', priority: '0.6', changefreq: 'monthly' },
  { path: '/list-property/rent', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
  { path: '/cookies', priority: '0.3', changefreq: 'yearly' },
  { path: '/accessibility', priority: '0.3', changefreq: 'yearly' },
  { path: '/login', priority: '0.5', changefreq: 'monthly' },
  { path: '/signup', priority: '0.5', changefreq: 'monthly' },
  { path: '/dashboard', priority: '0.4', changefreq: 'weekly' },
  { path: '/sitemap', priority: '0.3', changefreq: 'monthly' },
]

// Property categories (you can fetch these from your database)
const propertyTypes = [
  'serviced-plots',
  'luxury-homes',
  'affordable-housing',
  'waterfront',
  'agricultural-plots',
  'commercial',
  'residential',
  'industrial',
]

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://propsafehub.com'
  const now = new Date().toISOString()

  // Generate property type pages
  const propertyTypePages = propertyTypes.map((type) => ({
    path: `/properties/type/${type}`,
    priority: '0.7',
    changefreq: 'daily',
  }))

  // Combine all routes
  const allRoutes = [...staticRoutes, ...propertyTypePages]

  // Start building XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" `
  xml += `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" `
  xml += `xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 `
  xml += `http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`

  // Add each URL to the sitemap
  allRoutes.forEach((route) => {
    xml += `  <url>\n`
    xml += `    <loc>${baseUrl}${route.path}</loc>\n`
    xml += `    <lastmod>${now}</lastmod>\n`
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`
    xml += `    <priority>${route.priority}</priority>\n`
    xml += `  </url>\n`
  })

  xml += `</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
