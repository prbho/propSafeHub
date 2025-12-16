import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'

import './globals.css'

import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'

import Chatbot from '@/components/chatbot/Chatbot'
import CookieConsent from '@/components/CookieConsent'
// import { FloatingAccessibilityWidget } from '@/components/FloatingAccessibilityWidget'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { SEOProvider } from '@/components/SEOProvider'
import { StructuredData } from '@/components/StructuredData'
import { ToastProvider } from '@/components/ToastProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

// SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://propsafehub.com'),
  title: {
    default: 'PropSafe Hub | Verified Real Estate Investments',
    template: '%s | PropSafe Hub',
  },
  description:
    'Your Secured Pathway to Verified Real Estate Investments in Nigeria. 100% verified properties, title verification, investment advisory, and diaspora services.',
  keywords: [
    'real estate Nigeria',
    'property verification',
    'verified properties Lagos',
    'real estate investment Nigeria',
    'property title check',
    'diaspora real estate',
    'safe property investment',
    'land verification Nigeria',
    'real estate advisory',
    'mortgage financing Nigeria',
  ],
  authors: [{ name: 'PropSafe Hub', url: 'https://propsafehub.com' }],
  creator: 'PropSafe Hub',
  publisher: 'PropSafe Hub',
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://propsafehub.com',
    title: 'PropSafe Hub | Verified Real Estate Investments',
    description: 'Your Secured Pathway to Verified Real Estate Investments',
    siteName: 'PropSafe Hub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PropSafe Hub - Verified Real Estate Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropSafe Hub | Verified Real Estate Investments',
    description: 'Your Secured Pathway to Verified Real Estate Investments',
    images: ['/twitter-image.png'],
    creator: '@propsafehub',
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'real estate',
}

// Viewport settings
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'light dark',
}

// JSON-LD structured data for homepage
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'PropSafe Hub',
  description: 'Verified Real Estate Investment Platform in Nigeria',
  url: 'https://propsafehub.com',
  logo: 'https://propsafehub.com/logo.png',
  telephone: '+234-902-355-8992',
  email: 'info@propsafehub.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '50, Emerald Avenue, Monastery Road',
    addressLocality: 'Sangotedo, Ajah',
    addressRegion: 'Lagos',
    addressCountry: 'NG',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '6.465422',
    longitude: '3.406448',
  },
  sameAs: [
    'https://facebook.com/propsafehub',
    'https://twitter.com/propsafehub',
    'https://linkedin.com/company/propsafehub',
    'https://instagram.com/propsafehub',
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '10:00',
      closes: '16:00',
    },
  ],
  priceRange: '₦',
  areaServed: ['Nigeria', 'Africa'],
  serviceType: [
    'Property Verification',
    'Real Estate Investment Advisory',
    'Diaspora Property Purchase',
    'Mortgage Financing',
    'Construction Management',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Accessibility styles */}
        <style>{`
          .high-contrast {
            --text-color: #ffffff;
            --bg-color: #000000;
            --primary-color: #00ff00;
            --secondary-color: #ffff00;
          }
          
          .high-contrast body {
            background-color: #000000 !important;
            color: #ffffff !important;
          }
          
          .high-contrast a {
            color: #00ff00 !important;
            text-decoration: underline !important;
          }
          
          .high-contrast button,
          .high-contrast [role="button"] {
            background-color: #00ff00 !important;
            color: #000000 !important;
            border: 2px solid #ffffff !important;
          }
          
          .high-contrast input,
          .high-contrast textarea,
          .high-contrast select {
            background-color: #000000 !important;
            color: #ffffff !important;
            border: 2px solid #00ff00 !important;
          }
          
          .reduce-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          
          .grayscale {
            filter: grayscale(100%) !important;
          }
          
          .link-underline a {
            text-decoration: underline !important;
          }
          
          /* Focus styles for accessibility */
          :focus-visible {
            outline: 3px solid #059669 !important;
            outline-offset: 2px !important;
          }
          
          /* Skip to content link */
          .skip-to-content {
            position: absolute;
            top: -40px;
            left: 0;
            background: #059669;
            color: white;
            padding: 8px 16px;
            z-index: 1000;
            text-decoration: none;
          }
          
          .skip-to-content:focus {
            top: 0;
          }
        `}</style>

        {/* Structured Data */}
        <StructuredData data={jsonLd} />

        <script
          dangerouslySetInnerHTML={{
            __html: `
      if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    `,
          }}
        />
      </head>
      <body className="antialiased">
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        {/* Google Analytics Script (if using) */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />

        {/* Providers */}
        <LoadingProvider>
          <AuthProvider>
            <AccessibilityProvider>
              <SEOProvider>
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
                        <p className="text-gray-600">Loading PropSafe Hub...</p>
                      </div>
                    </div>
                  }
                >
                  <Header />
                  <main id="main-content" className="min-h-screen">
                    {children}
                  </main>
                  <Footer />
                  <Chatbot />
                  {/* <FloatingAccessibilityWidget /> */}
                  <ToastProvider />
                  <CookieConsent />
                </Suspense>
              </SEOProvider>
            </AccessibilityProvider>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
