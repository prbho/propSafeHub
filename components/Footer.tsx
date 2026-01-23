// components/Footer/Footer.tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Facebook,
  FileText,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Users,
} from 'lucide-react'

const SOCIALS = [
  {
    label: 'Facebook',
    icon: Facebook,
    href: 'https://facebook.com/propsafehub',
  },
  { label: 'Twitter', icon: Twitter, href: 'https://twitter.com/propsafehub' },
  {
    label: 'Instagram',
    icon: Instagram,
    href: 'https://instagram.com/propsafehub',
  },
  {
    label: 'LinkedIn',
    icon: Linkedin,
    href: 'https://linkedin.com/company/propsafehub',
  },
]

interface PopularLocation {
  name: string
  count: number
  type: 'sale' | 'rent'
  avgPrice?: number
  growth?: number
}

interface FooterData {
  popularMarkets: PopularLocation[]
  popularApartments: PopularLocation[]
  resources: {
    title: string
    href: string
  }[]
  states: string[]
  stats?: {
    totalProperties: number
    verifiedProperties: number
    happyClients: number
    citiesCovered: number
  }
}

const COMPANY_LINKS = [
  {
    title: 'About Us',
    href: '/about',
    description: 'Our story, mission & team',
  },
  {
    title: 'Services',
    href: '/services',
    description: 'All our offerings',
  },
  {
    title: 'Properties',
    href: '/properties',
    description: 'Browse listings',
  },
  {
    title: 'Contact',
    href: '/contact',
    description: 'Get in touch',
  },
]

const SERVICE_LINKS = [
  {
    title: 'Property Verification',
    href: '/services/verification',
    icon: FileText,
    description: 'Verify any property',
  },
  {
    title: 'Investment Advisory',
    href: '/services/advisory',
    icon: Users,
    description: 'Expert guidance',
  },
  {
    title: 'Diaspora Services',
    href: '/services/diaspora',
    icon: Globe,
    description: 'Invest from abroad',
  },
  {
    title: 'Mortgage Financing',
    href: '/services/mortgage',
    description: 'Home loan assistance',
  },
  {
    title: 'Construction',
    href: '/services/construction',
    description: 'Building & development',
  },
]

// const RESOURCE_LINKS = [
//   { title: 'Blog & Guides', href: '/blog', description: 'Latest insights' },
//   { title: 'Market Reports', href: '/reports', description: 'Industry data' },
//   { title: 'FAQ', href: '/faq', description: 'Common questions' },
//   { title: 'Careers', href: '/careers', description: 'Join our team' },
//   { title: 'Press', href: '/press', description: 'News & media' },
// ]

const LEGAL_LINKS = [
  { title: 'Privacy Policy', href: '/privacy' },
  { title: 'Terms of Service', href: '/terms' },
  { title: 'Cookie Policy', href: '/cookies' },
  { title: 'Disclaimer', href: '/disclaimer' },
]

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData>({
    popularMarkets: [],
    popularApartments: [],
    resources: [],
    states: [],
    stats: undefined,
  })

  const getFallbackData = (): FooterData => {
    return {
      popularMarkets: [
        {
          name: 'Lekki, Lagos',
          count: 1240,
          type: 'sale',
          avgPrice: 85000000,
          growth: 12,
        },
        {
          name: 'Victoria Island',
          count: 890,
          type: 'sale',
          avgPrice: 120000000,
          growth: 8,
        },
        {
          name: 'Ikoyi, Lagos',
          count: 670,
          type: 'sale',
          avgPrice: 150000000,
          growth: 15,
        },
        {
          name: 'Abuja Central',
          count: 1560,
          type: 'sale',
          avgPrice: 95000000,
          growth: 18,
        },
        {
          name: 'Ikeja, Lagos',
          count: 980,
          type: 'sale',
          avgPrice: 65000000,
          growth: 10,
        },
      ],
      popularApartments: [
        {
          name: 'Maitama, Abuja',
          count: 320,
          type: 'rent',
          avgPrice: 3500000,
          growth: 5,
        },
        {
          name: 'Yaba, Lagos',
          count: 280,
          type: 'rent',
          avgPrice: 1800000,
          growth: 12,
        },
        {
          name: 'Gwarinpa, Abuja',
          count: 190,
          type: 'rent',
          avgPrice: 2200000,
          growth: 8,
        },
        {
          name: 'Surulere, Lagos',
          count: 210,
          type: 'rent',
          avgPrice: 1600000,
          growth: 6,
        },
        {
          name: 'Asokoro, Abuja',
          count: 150,
          type: 'rent',
          avgPrice: 4200000,
          growth: 15,
        },
      ],
      resources: [
        { title: 'Homes for sale near me', href: '/properties?type=buy' },
        {
          title: 'Apartments for rent',
          href: '/properties?type=rent&propertyType=apartment',
        },
        { title: 'Property valuation', href: '/valuation' },
        { title: 'Real estate guides', href: '/guides' },
        { title: 'Mortgage calculator', href: '/calculator' },
        { title: 'Agent directory', href: '/agents' },
      ],
      states: [
        'Lagos',
        'Abuja',
        'Rivers',
        'Oyo',
        'Kano',
        'Kaduna',
        'Edo',
        'Delta',
        'Ogun',
        'Enugu',
      ],
      stats: {
        totalProperties: 12540,
        verifiedProperties: 10200,
        happyClients: 52300,
        citiesCovered: 28,
      },
    }
  }

  useEffect(() => {
    // Fetch footer data from API
    const fetchFooterData = async () => {
      try {
        const response = await fetch('/api/footer-data')
        if (response.ok) {
          const data = await response.json()
          setFooterData(data)
        } else {
          setFooterData(getFallbackData())
        }
      } catch (error) {
        console.error('Error fetching footer data:', error)
        setFooterData(getFallbackData())
      }
    }

    fetchFooterData()
  }, [])

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(0)}M`
    } else if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`
    }
    return `₦${price}`
  }

  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid - Now 7 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand + Contact - Spans 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  width={64}
                  height={64}
                  src="/logo2.png"
                  alt="PropSafe Hub"
                  className="h-16 w-auto"
                />
              </Link>
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  PropSafeHub
                </h3>
                <p className="text-emerald-500 text-sm">
                  Nigeria&apos;s Trusted Property Hub
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              A trusted platform for exploring safe, verified properties — built
              to help you rent and buy with confidence across Nigeria.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 pt-3">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  aria-label={label}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-emerald-600 transition-all"
                >
                  <Icon className="w-5 h-5 text-slate-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Real Estate Markets */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              Hot Markets
            </h4>
            <ul className="space-y-3">
              {footerData.popularMarkets.slice(0, 5).map((market, index) => (
                <li key={index}>
                  <Link
                    href={`/properties?location=${encodeURIComponent(market.name)}&type=buy`}
                    className="text-slate-400 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="group-hover:text-emerald-400 transition-colors text-sm">
                        {market.name}
                      </span>
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded-full group-hover:bg-emerald-600 transition-colors">
                        {market.count}
                      </span>
                    </div>
                    {market.avgPrice && (
                      <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                        <span>Avg: {formatPrice(market.avgPrice)}</span>
                        {market.growth && (
                          <span className="text-emerald-500">
                            ↑{market.growth}%
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/properties?type=buy"
              className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 text-sm font-medium mt-3 group"
            >
              See more markets
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Popular Apartment Cities */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              Top Rentals
            </h4>
            <ul className="space-y-3">
              {footerData.popularApartments
                .slice(0, 5)
                .map((apartment, index) => (
                  <li key={index}>
                    <Link
                      href={`/properties?location=${encodeURIComponent(apartment.name)}&type=rent&propertyType=apartment`}
                      className="text-slate-400 hover:text-white transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="group-hover:text-emerald-400 transition-colors text-sm">
                          {apartment.name}
                        </span>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded-full group-hover:bg-emerald-600 transition-colors">
                          {apartment.count}
                        </span>
                      </div>
                      {apartment.avgPrice && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                          <span>Avg: {formatPrice(apartment.avgPrice)}/yr</span>
                          {apartment.growth && (
                            <span className="text-emerald-500">
                              ↑{apartment.growth}%
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
            </ul>
            <Link
              href="/properties?type=rent&propertyType=apartment"
              className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 text-sm font-medium mt-3 group"
            >
              See more cities
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              Company
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors group flex items-start gap-2"
                  >
                    <div>
                      <div className="text-sm group-hover:text-emerald-400 transition-colors">
                        {link.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {link.description}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              Services
            </h4>
            <ul className="space-y-3">
              {SERVICE_LINKS.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm group-hover:text-emerald-400 transition-colors">
                        {link.title}
                      </span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    {link.description && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {link.description}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-500 text-sm text-center md:text-left">
              <div className="mb-1">
                © {new Date().getFullYear()} PropSafeHub — All Rights Reserved.
              </div>
              {/* Cofellow Attribution */}
              {/* <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 hover:text-slate-400 transition-colors group">
                <Code2 className="h-3 w-3" />
                <span>Web Development by</span>
                <Link
                  href="https://cofellow.com?utm_source=propsafehub&utm_medium=footer&utm_campaign=portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1"
                >
                  Cofellow
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div> */}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="text-slate-500 hover:text-emerald-400 transition-colors"
                >
                  {link.title}
                </Link>
              ))}
              <span className="text-slate-600">|</span>
              <Link
                href="/site-map"
                className="text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Sitemap
              </Link>
              <Link
                href="/accessibility"
                className="text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
