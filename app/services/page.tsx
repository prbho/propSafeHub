'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building,
  CheckCircle,
  ChevronRight,
  DollarSign,
  FileCheck,
  Globe,
  HardHat,
  Home,
  MessageCircleMore,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ServicesPage() {
  const allServices = [
    {
      id: 1,
      title: 'Verified Property Listings',
      description:
        'Access carefully curated properties that have passed our multi-stage verification process.',
      icon: Home,
      href: '/properties',
      color: 'bg-gray-900',
      features: [
        'Title verification',
        'Developer credibility check',
        'Government compliance',
        '100% safe listings only',
      ],
      stats: '10,000+ Verified Properties',
    },
    {
      id: 2,
      title: 'Property Verification',
      description:
        'Comprehensive due diligence for any property, even those not listed with us.',
      icon: CheckCircle,
      href: '/services/verification',
      color: 'bg-emerald-600',
      features: [
        'Document authentication',
        'Site verification',
        'Encumbrance checks',
        'Red flag detection',
      ],
      stats: 'Zero Hidden Risks',
    },
    {
      id: 3,
      title: 'Investment Advisory',
      description:
        'Personalized investment strategy and market intelligence for optimal returns.',
      icon: TrendingUp,
      href: '/services/advisory',
      color: 'bg-emerald-600',
      features: [
        'Market analysis',
        'ROI projections',
        'Portfolio strategy',
        'Risk assessment',
      ],
      stats: 'PropSafe Consult™',
    },
    {
      id: 4,
      title: 'Diaspora Services',
      description:
        'Complete support for international investors buying Nigerian real estate.',
      icon: Globe,
      href: '/services/diaspora',
      color: 'bg-emerald-600',
      features: [
        'Virtual inspections',
        'Digital paperwork',
        'Secure escrow',
        'Trusted representatives',
      ],
      stats: 'Global Reach, Local Trust',
    },
    {
      id: 5,
      title: 'Construction & Development',
      description: 'End-to-end construction services and project management.',
      icon: Building,
      href: '/services/construction',
      color: 'bg-emerald-600',
      features: [
        'Architectural design',
        'Construction supervision',
        'Turnkey projects',
        'Renovation services',
      ],
      stats: '200+ Projects Completed',
    },
    {
      id: 6,
      title: 'Mortgage Financing',
      description:
        'Access affordable mortgage options through our trusted banking partners.',
      icon: Briefcase,
      href: '/services/mortgage',
      color: 'bg-emerald-600',
      features: [
        'Low-interest plans',
        '5-30 year tenure',
        'Partner bank access',
        'Full application support',
      ],
      stats: 'Multiple Partner Banks',
    },
    {
      id: 7,
      title: 'Real Estate Marketing',
      description:
        'Boost property credibility and sales through our platform partnership.',
      icon: BarChart3,
      href: '/developers',
      color: 'bg-emerald-600',
      features: [
        'Developer partnerships',
        'Wider investor access',
        'Credibility boost',
        'Sales conversion',
      ],
      stats: 'Partner with Top Developers',
    },
    {
      id: 8,
      title: 'Legal & Documentation',
      description:
        'Complete legal support for property transactions and title processing.',
      icon: FileCheck,
      href: '/legal',
      color: 'bg-emerald-600',
      features: [
        'Title processing',
        'Legal documentation',
        'Compliance checks',
        'Dispute resolution',
      ],
      stats: 'Full Legal Support',
    },
  ]

  const processSteps = [
    {
      step: 1,
      title: 'Discovery & Consultation',
      description: 'Understand your needs and investment goals',
      icon: Users,
    },
    {
      step: 2,
      title: 'Property Search & Verification',
      description: 'Find and vet suitable properties using PropSafe Verify™',
      icon: Shield,
    },
    {
      step: 3,
      title: 'Due Diligence & Analysis',
      description: 'Comprehensive risk assessment and ROI analysis',
      icon: FileCheck,
    },
    {
      step: 4,
      title: 'Transaction & Documentation',
      description: 'Secure payment processing and legal documentation',
      icon: DollarSign,
    },
    {
      step: 5,
      title: 'Post-Purchase Support',
      description: 'Property management, construction, or resale support',
      icon: HardHat,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Comprehensive Real Estate Solutions
            </h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
              From property verification to mortgage financing—we provide
              end-to-end services for safe, profitable real estate investments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100 px-8"
              >
                <Link href="#all-services">Explore Services</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/schedule-meeting">Book Free Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The PropSafe Hub Process
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A systematic approach ensuring safety, transparency, and
              profitability at every step
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {processSteps.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white p-6 rounded-2xl text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-xl mx-auto mb-4">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>

                {step.step < 5 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="h-6 w-full text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Services */}
      <section id="all-services" className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Comprehensive Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every service designed to protect your investment and maximize
              returns
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allServices.map((service) => (
              <div
                key={service.id}
                className="group bg-white border-gray-200 rounded-2xl border shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Service Header */}
                <div
                  className={`${service.color} rounded-t-2xl p-6 text-white`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <service.icon className="h-8 w-8" />
                    <div className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                      {service.stats}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{service.title}</h3>
                </div>

                {/* Service Body */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6">{service.description}</p>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full text-gray-900 bg-transparent border border-gray-400 hover:opacity-90`}
                  >
                    <Link href={service.href}>
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PropSafe Ecosystem */}
      <section className="py-16 bg-linear-to-r from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The PropSafe Ecosystem
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our proprietary systems that set us apart in the real estate
              industry
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'PropSafe Score™',
                description:
                  'A scoring system that rates each property based on documentation strength, developer track record, and appreciation potential.',
                features: [
                  'Risk Assessment',
                  'Investment Grade',
                  'Future Value Prediction',
                ],
              },
              {
                name: 'PropSafe Verify™',
                description:
                  'Full digital verification service for any property—even if not listed with us.',
                features: [
                  '360° Due Diligence',
                  'Legal Compliance Check',
                  'Physical Verification',
                ],
              },
              {
                name: 'PropSafe Consult™',
                description:
                  'Investment planning, advisory, and one-on-one strategy sessions.',
                features: [
                  'Market Intelligence',
                  'Personalized Strategy',
                  'ROI Optimization',
                ],
              },
            ].map((system, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border shadow-lg"
              >
                <div className="inline-flex px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full text-sm font-semibold mb-4">
                  {system.name}
                </div>

                <p className="text-gray-600 mb-6">{system.description}</p>

                <ul className="space-y-3">
                  {system.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Who We Serve
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                title: 'First-Time Buyers',
                description: 'Guidance through your first property purchase',
                services: [
                  'Verification',
                  'Mortgage Support',
                  'Legal Guidance',
                ],
              },
              {
                title: 'Seasoned Investors',
                description: 'Portfolio growth and strategic investments',
                services: [
                  'Market Analysis',
                  'Portfolio Strategy',
                  'High-Value Deals',
                ],
              },
              {
                title: 'Diaspora Clients',
                description: 'Secure investment from anywhere in the world',
                services: [
                  'Virtual Tours',
                  'Escrow Services',
                  'Remote Management',
                ],
              },
              {
                title: 'Developers & Sellers',
                description: 'Platform partnership and credibility boost',
                services: [
                  'Listing Verification',
                  'Investor Access',
                  'Marketing Support',
                ],
              },
            ].map((audience, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {audience.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {audience.description}
                </p>

                <ul className="space-y-2">
                  {audience.services.map((service, sIdx) => (
                    <li
                      key={sIdx}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <ChevronRight className="h-3 w-3 text-emerald-500 mr-2" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Invest With Confidence?
            </h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of Nigerians who trust PropSafe Hub for safe,
              profitable real estate investments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6"
              >
                <Link href="/properties">
                  <Home className="mr-2 h-5 w-5" />
                  Browse Properties
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10 px-8 py-6"
              >
                <Link href="/schedule-meeting">
                  <MessageCircleMore className="mr-2 h-5 w-5" />
                  Free Consultation
                </Link>
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-emerald-500">
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">24/7</div>
                  <div className="text-emerald-200 text-sm">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">100%</div>
                  <div className="text-emerald-200 text-sm">
                    Verified Properties
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">0%</div>
                  <div className="text-emerald-200 text-sm">Hidden Charges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
