'use client'

import { useState } from 'react' // Remove useEffect import
import Link from 'next/link'
import {
  Building,
  Calendar,
  ChevronRight,
  FileText,
  Globe,
  Handshake,
  HelpCircle,
  Home,
  Lock,
  Map,
  MessageSquare,
  Phone,
  Search,
  Settings,
  Shield,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SitemapCategory {
  title: string
  description: string
  icon: React.ElementType
  color: string
  links: {
    title: string
    href: string
    description: string
    badge?: 'New' | 'Popular' | 'Featured'
    icon?: React.ElementType
  }[]
}

// Move data outside component (static data)
const sitemapData: SitemapCategory[] = [
  {
    title: 'Home & Main Pages',
    description: 'Primary navigation and essential pages',
    icon: Home,
    color: 'bg-emerald-600',
    links: [
      {
        title: 'Home',
        href: '/',
        description: 'PropSafe Hub homepage',
        icon: Home,
      },
      {
        title: 'About Us',
        href: '/about',
        description: 'Learn about PropSafe Hub',
      },
      {
        title: 'Contact Us',
        href: '/contact',
        description: 'Get in touch with our team',
        icon: Phone,
      },
      {
        title: 'Schedule Meeting',
        href: '/schedule-meeting',
        description: 'Book a consultation',
        badge: 'New',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'Properties',
    description: 'Browse verified real estate listings',
    icon: Building,
    color: 'bg-emerald-600',
    links: [
      {
        title: 'All Properties',
        href: '/properties',
        description: 'View all verified properties',
        badge: 'Popular',
        icon: Building,
      },
      {
        title: 'Buy Properties',
        href: '/buy',
        description: 'Properties for sale',
      },
      {
        title: 'Rent Properties',
        href: '/rent',
        description: 'Properties for rent',
      },
      {
        title: 'Sell Property',
        href: '/sell',
        description: 'List your property for sale',
      },
      {
        title: 'Serviced Plots',
        href: '/properties/type/serviced-plots',
        description: 'Ready-to-build land',
      },
      {
        title: 'Luxury Homes',
        href: '/properties/type/luxury-homes',
        description: 'Premium residential properties',
      },
      {
        title: 'Affordable Housing',
        href: '/properties/type/affordable-housing',
        description: 'Budget-friendly options',
      },
      {
        title: 'Waterfront Properties',
        href: '/properties/type/waterfront',
        description: 'Properties near water bodies',
      },
      {
        title: 'Investment Plots',
        href: '/properties/type/agricultural-plots',
        description: 'Agricultural and investment land',
      },
    ],
  },
  {
    title: 'Services',
    description: 'Our real estate solutions and offerings',
    icon: Shield,
    color: 'bg-emerald-600',
    links: [
      {
        title: 'All Services',
        href: '/services',
        description: 'Overview of all services',
        icon: Shield,
      },
      {
        title: 'Property Verification',
        href: '/services/verification',
        description: 'Document and title verification',
        badge: 'Featured',
      },
      {
        title: 'Investment Advisory',
        href: '/services/advisory',
        description: 'Personalized investment strategies',
      },
      {
        title: 'Diaspora Services',
        href: '/services/diaspora',
        description: 'Overseas investor support',
        icon: Globe,
      },
      {
        title: 'Mortgage Financing',
        href: '/services/mortgage',
        description: 'Home loan assistance',
      },
      {
        title: 'Construction Management',
        href: '/services/construction',
        description: 'Turnkey building projects',
      },
      {
        title: 'PropSafe Score™',
        href: '/propsafe-score',
        description: 'Property risk assessment system',
      },
      {
        title: 'PropSafe Verify™',
        href: '/verify',
        description: 'Property verification tool',
      },
    ],
  },
  {
    title: 'For Investors & Partners',
    description: 'Investment opportunities and partnerships',
    icon: TrendingUp,
    color: 'bg-emerald-600',
    links: [
      {
        title: 'Investor Portal',
        href: '/investors',
        description: 'Investment opportunities',
        icon: TrendingUp,
      },
      {
        title: 'Portfolio Management',
        href: '/investors/portfolio',
        description: 'Manage your investments',
      },
      {
        title: 'ROI Calculator',
        href: '/roi-calculator',
        description: 'Calculate potential returns',
      },
      {
        title: 'Partner with Us',
        href: '/partners',
        description: 'Business collaboration',
        icon: Handshake,
      },
      {
        title: 'For Developers',
        href: '/developers',
        description: 'Developer partnership program',
      },
      {
        title: 'Referral Program',
        href: '/referral',
        description: 'Earn through referrals',
      },
    ],
  },
  {
    title: 'Agents & Professionals',
    description: 'Real estate agent resources',
    icon: Users,
    color: 'bg-emerald-600',
    links: [
      {
        title: 'Find Agents',
        href: '/agents',
        description: 'Browse verified agents',
        icon: Users,
      },
      {
        title: 'Become an Agent',
        href: '/become-agent',
        description: 'Join our agent network',
      },
      {
        title: 'Agent Dashboard',
        href: '/agent/dashboard',
        description: 'Agent management portal',
      },
      {
        title: 'List Property',
        href: '/list-property',
        description: 'Post new listings',
      },
      {
        title: 'Agent Resources',
        href: '/agent/resources',
        description: 'Tools and guides for agents',
      },
      {
        title: 'Agent Training',
        href: '/agent/training',
        description: 'Training and certification',
      },
    ],
  },
  {
    title: 'Resources & Learning',
    description: 'Educational content and guides',
    icon: FileText,
    color: 'bg-emerald-600',
    links: [
      {
        title: 'Blog',
        href: '/blog',
        description: 'Real estate insights and articles',
        icon: FileText,
      },
      {
        title: 'FAQs',
        href: '/faqs',
        description: 'Frequently asked questions',
        badge: 'Popular',
        icon: HelpCircle,
      },
      {
        title: 'Property Guides',
        href: '/guides',
        description: 'Buying and selling guides',
      },
      {
        title: 'Market Reports',
        href: '/market-reports',
        description: 'Real estate market analysis',
      },
      {
        title: 'Legal Guides',
        href: '/legal-guides',
        description: 'Property law and documentation',
      },
      {
        title: 'Diaspora Investor Guide',
        href: '/diaspora-guide',
        description: 'Guide for overseas investors',
      },
      {
        title: 'Scam Prevention',
        href: '/scam-prevention',
        description: 'Avoid real estate fraud',
      },
      {
        title: 'Property Verification Guide',
        href: '/verification-guide',
        description: 'How to verify properties',
      },
    ],
  },
  {
    title: 'Account & Settings',
    description: 'User account management',
    icon: User,
    color: 'bg-emerald-600',
    links: [
      {
        title: 'Login',
        href: '/login',
        description: 'Sign in to your account',
        icon: User,
      },
      {
        title: 'Sign Up',
        href: '/signup',
        description: 'Create a new account',
      },
      {
        title: 'Dashboard',
        href: '/dashboard',
        description: 'User dashboard',
      },
      {
        title: 'My Profile',
        href: '/profile',
        description: 'Manage your profile',
      },
      {
        title: 'Favorites',
        href: '/favorites',
        description: 'Saved properties',
      },
      {
        title: 'Messages',
        href: '/messages',
        description: 'Your conversations',
        icon: MessageSquare,
      },
      {
        title: 'Notifications',
        href: '/notifications',
        description: 'Account notifications',
      },
      {
        title: 'Settings',
        href: '/settings',
        description: 'Account settings',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Legal & Compliance',
    description: 'Legal information and policies',
    icon: Lock,
    color: 'bg-emerald-600',
    links: [
      {
        title: 'Privacy Policy',
        href: '/privacy',
        description: 'Data protection and privacy',
        icon: Lock,
      },
      {
        title: 'Terms of Service',
        href: '/terms',
        description: 'Terms and conditions',
      },
      {
        title: 'Disclaimer',
        href: '/disclaimer',
        description: 'Legal disclaimer',
      },
      {
        title: 'Cookie Policy',
        href: '/cookies',
        description: 'Cookie usage information',
      },
      {
        title: 'Accessibility',
        href: '/accessibility',
        description: 'Accessibility statement',
      },
      {
        title: 'Code of Conduct',
        href: '/code-of-conduct',
        description: 'Community guidelines',
      },
      {
        title: 'Anti-Scam Policy',
        href: '/anti-scam',
        description: 'Fraud prevention measures',
      },
    ],
  },
]

export default function SitemapPage() {
  // Remove useEffect and useState for sitemapData, use static data directly
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Filter links based on search and active category
  const filteredData = sitemapData
    .filter(
      (category) =>
        activeCategory === 'all' || category.title === activeCategory
    )
    .map((category) => ({
      ...category,
      links: category.links.filter(
        (link) =>
          searchQuery === '' ||
          link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.links.length > 0)

  // Count total links
  const totalLinks = sitemapData.reduce(
    (total, category) => total + category.links.length,
    0
  )

  // The rest of your component remains the same...
  // [Keep all the JSX code exactly as you have it]

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-emerald-600 to-emerald-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <Map className="h-12 w-12" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-6">
              PropSafe Hub Sitemap
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Explore all pages and sections of our real estate platform. Find
              exactly what you&apos;re looking for quickly and easily.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Search pages (e.g., 'properties', 'contact', 'verification')"
                  className="pl-12 text-gray-900 py-6 rounded-full border-0 shadow-lg bg-white/90 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100"
              >
                <Link href="/">Back to Home</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent hover:text-white text-white hover:bg-white/10"
              >
                <a href="/sitemap.xml" download>
                  Download XML Sitemap
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {sitemapData.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {totalLinks}
              </div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                100%
              </div>
              <div className="text-sm text-gray-600">Verified Content</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-600">Updated</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Category Tabs */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Browse by Category
            </h2>
            <div className="text-sm text-gray-500">
              Showing{' '}
              {filteredData.reduce((total, cat) => total + cat.links.length, 0)}{' '}
              of {totalLinks} pages
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex flex-wrap h-auto p-1 bg-gray-100 rounded-xl mb-8">
              <TabsTrigger
                value="all"
                className="rounded-lg px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                All Pages
              </TabsTrigger>
              {sitemapData.map((category) => (
                <TabsTrigger
                  key={category.title}
                  value={category.title}
                  className="rounded-lg px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((category, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <CardHeader className="border-b">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`${category.color} p-2.5 rounded-lg`}>
                          <category.icon className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">
                          {category.title}
                        </CardTitle>
                      </div>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {category.links.map((link, linkIndex) => (
                          <Link
                            key={linkIndex}
                            href={link.href}
                            className="group flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100"
                          >
                            <div className="flex items-center gap-3">
                              {link.icon && (
                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                  <link.icon className="h-4 w-4 text-gray-600 group-hover:text-emerald-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 group-hover:text-emerald-700">
                                    {link.title}
                                  </span>
                                  {link.badge && (
                                    <Badge
                                      variant={
                                        link.badge === 'Featured'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                      className=" text-xs bg-transparent border border-gray-300 text-gray-500"
                                    >
                                      {link.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 truncate">
                                  {link.description}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Individual category tabs */}
            {sitemapData.map((category) => (
              <TabsContent
                key={category.title}
                value={category.title}
                className="mt-0"
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-linear-to-r from-emerald-50 to-green-50 border-b">
                    <div className="flex items-center gap-4">
                      <div className={`${category.color} p-3 rounded-lg`}>
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {category.title}
                        </CardTitle>
                        <p className="text-gray-600 mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.links
                        .filter(
                          (link) =>
                            searchQuery === '' ||
                            link.title
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            link.description
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .map((link, linkIndex) => (
                          <Link
                            key={linkIndex}
                            href={link.href}
                            className="group relative p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="h-5 w-5 text-emerald-500" />
                            </div>

                            <div className="flex items-start gap-4">
                              {link.icon ? (
                                <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                  <link.icon className="h-6 w-6 text-emerald-600" />
                                </div>
                              ) : (
                                <div
                                  className={`p-3 ${category.color.replace('bg-', 'bg-')} bg-opacity-10 rounded-lg`}
                                >
                                  <category.icon className="h-6 w-6 text-gray-600" />
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-emerald-700">
                                    {link.title}
                                  </h3>
                                  {link.badge && (
                                    <Badge
                                      variant={
                                        link.badge === 'Featured'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                      className="text-xs bg-transparent border border-gray-300 text-gray-500"
                                    >
                                      {link.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                  {link.description}
                                </p>
                                <div className="text-xs text-gray-400 truncate">
                                  {link.href}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* SEO Information */}
        <Card className="border-0 shadow-xl bg-linear-to-r from-emerald-50 to-emerald-50">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  SEO & Website Structure
                </h3>
                <p className="text-gray-700 mb-6">
                  Our comprehensive sitemap ensures search engines can easily
                  crawl and index all our content, improving visibility and
                  helping users find exactly what they&apos;re looking for on
                  PropSafe Hub.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-lg font-semibold text-emerald-600 mb-1">
                      Fast Indexing
                    </div>
                    <div className="text-sm text-gray-600">
                      Quick discovery by search engines
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-lg font-semibold text-emerald-600 mb-1">
                      Mobile Optimized
                    </div>
                    <div className="text-sm text-gray-600">
                      Perfect experience on all devices
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Technical Details
                  </h4>
                  <div className="bg-white p-6 rounded-xl border">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <span className="text-gray-600">Sitemap Format</span>
                        <span className="font-medium">XML & HTML</span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-3">
                        <span className="text-gray-600">Encoding</span>
                        <span className="font-medium">UTF-8</span>
                      </div>
                      <div className="flex items-center justify-between border-b pb-3">
                        <span className="text-gray-600">Update Frequency</span>
                        <span className="font-medium text-emerald-600">
                          Daily
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          ✓ Active & Indexed
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View XML Sitemap
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Robots.txt
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Need Help Finding Something?
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/contact">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/faqs">
                <HelpCircle className="h-4 w-4 mr-2" />
                Visit FAQ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
