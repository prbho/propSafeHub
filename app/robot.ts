// Alternative: app/robots.txt route handler
import { NextResponse } from 'next/server'

export async function GET() {
  const robotsTxt = `# PropSafe Hub Robots.txt
# Last Updated: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /
Allow: /properties/
Allow: /agents/
Allow: /services/
Allow: /about
Allow: /contact
Allow: /faqs
Allow: /login
Allow: /signup
Allow: /privacy
Allow: /terms
Allow: /disclaimer
Allow: /cookies
Allow: /accessibility

# Disallow private areas
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /agent/properties/edit/
Disallow: /profile/user/
Disallow: /verify/
Disallow: /payment/verify/
Disallow: /env/

# Disallow search query strings that don't affect content
Disallow: /*?*sort=
Disallow: /*?*filter=
Disallow: /*?*page=

# Disallow admin and agent dashboard pages
Disallow: /admin/dashboard
Disallow: /admin/users
Disallow: /admin/approvals
Disallow: /admin/upload
Disallow: /agent/dashboard
Disallow: /agent/properties
Disallow: /agent/leads
Disallow: /agent/analytics
Disallow: /agent/messages

# Disallow user account pages (still accessible but not indexed)
Disallow: /dashboard
Disallow: /favorites
Disallow: /messages
Disallow: /notifications
Disallow: /settings
Disallow: /profile
Disallow: /calculations/history

# Disallow listing property pages (form submissions)
Disallow: /list-property
Disallow: /properties/post

# Crawl delay for good bots (requests per minute)
Crawl-delay: 2

# Sitemap location
Sitemap: https://propsafehub.com/sitemap.xml

# Host
Host: https://propsafehub.com

# Bot-specific rules
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Crawl-delay: 1

User-agent: Googlebot-Image
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Crawl-delay: 2

User-agent: Yandex
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Crawl-delay: 3

User-agent: Baiduspider
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Crawl-delay: 5

# Bad bots (scrapers, spam bots)
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: MauiBot
Disallow: /

# Sitewide sitemaps:
Sitemap: https://propsafehub.com/sitemap.xml
Sitemap: https://propsafehub.com/sitemap

# End of robots.txt`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
