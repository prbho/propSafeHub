'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  BarChart3,
  Briefcase,
  Building,
  CheckCircle,
  FileCheck,
  Globe,
  Handshake,
  HardHat,
  Home,
  Key,
  Shield,
  StarsIcon,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ServicesSection() {
  const { user, isAuthenticated } = useAuth()

  const services = [
    {
      id: 1,
      title: 'Buy a Home',
      description:
        'Find your perfect home with our extensive collection of 100% verified properties that have passed rigorous due diligence. Each listing includes our proprietary PropSafe Score™ for risk assessment.',
      icon: Home,
      buttonText: 'Browse Verified Properties',
      href: '/properties?type=buy',
      stats: '10,000+ Verified Properties',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      features: ['Title Verification', 'Location Analysis', 'ROI Projections'],
    },
    {
      id: 2,
      title: 'Sell a Home',
      description:
        'Maximize your property value with expert guidance, premium marketing, and competitive offers. Benefit from our partnership network and trusted platform credibility.',
      icon: TrendingUp,
      buttonText: 'List Property',
      href: '/list-property',
      stats: 'Get Top Market Value',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      features: [
        'Developer Partnership',
        'Wider Investor Access',
        'Credibility Boost',
      ],
    },
    {
      id: 3,
      title: 'Rent a Home',
      description:
        'Discover high-quality rental properties with thoroughly verified listings and a secure, reliable application process. Every property is authenticated for your peace of mind.',
      icon: Key,
      buttonText: 'Find Rentals',
      href: '/properties?type=rent',
      stats: '5,000+ Verified Rentals',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
      features: [
        'Secure Process',
        'Verified Listings',
        'Digital Documentation',
      ],
    },
    {
      id: 4,
      title: 'Property Verification',
      description:
        'Our PropSafe Verify™ service conducts comprehensive due diligence on any property—even those not listed with us. Avoid fraud and ensure 100% safe investments.',
      icon: CheckCircle,
      buttonText: 'Verify a Property',
      href: '#',
      stats: 'Zero Hidden Risks',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      features: [
        'Document Authentication',
        'Encumbrance Checks',
        'Red Flag Detection',
      ],
    },
    {
      id: 5,
      title: 'Investment Advisory',
      description:
        'Get personalized PropSafe Consult™ strategy sessions. We help you choose the right location, estate, and investment strategy for maximum profit and appreciation.',
      icon: BarChart3,
      buttonText: 'Book Consultation',
      href: '#',
      stats: 'Personalized Roadmaps',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      features: ['Market Intelligence', 'ROI Analysis', 'Portfolio Strategy'],
    },
    {
      id: 6,
      title: 'Diaspora Services',
      description:
        'Invest safely from anywhere in the world. We provide virtual inspections, digital paperwork, secure escrow payments, and trusted representatives for seamless transactions.',
      icon: Globe,
      buttonText: 'Invest from Abroad',
      href: '#',
      stats: 'Global Reach, Local Trust',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      buttonColor: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      features: ['Virtual Inspections', 'Secure Escrow', 'Progress Reports'],
    },
    {
      id: 7,
      title: 'Construction & Development',
      description:
        'Through our network of professionals, we offer architectural design, construction supervision, turnkey projects, and complete project management services.',
      icon: Building,
      buttonText: 'Start a Project',
      href: '#',
      stats: 'Turnkey Solutions',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      buttonColor: 'bg-orange-600 hover:bg-orange-700 text-white',
      features: [
        'Architectural Design',
        'Cost Estimation',
        'Quality Supervision',
      ],
    },
    {
      id: 8,
      title: 'Mortgage Financing',
      description:
        'Access affordable mortgage options through our trusted financial partners. We guide you through eligibility, application, and approval for stress-free home ownership.',
      icon: Briefcase,
      buttonText: 'Apply for Mortgage',
      href: '#',
      stats: '5-30 Year Tenure Options',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
      features: ['Low Interest Rates', 'Partner Banks', 'Full Support'],
    },
  ]

  const coreValues = [
    {
      icon: Shield,
      title: 'Safety First',
      description:
        'Your peace of mind is our priority. Zero hidden risks in every transaction.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: FileCheck,
      title: 'Integrity',
      description:
        'We tell the truth, always. 100% verified documentation and transparent processes.',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      title: 'Value Creation',
      description:
        'Every investment must appreciate. We focus on properties with strong ROI potential.',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: StarsIcon,
      title: 'Excellence',
      description:
        'Professional standards at every stage, from verification to after-sales support.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  const propertyTypes = [
    { name: 'Serviced Plots', count: '2,500+' },
    { name: 'Luxury Homes', count: '1,800+' },
    { name: 'Affordable Housing', count: '3,200+' },
    { name: 'Waterfront Properties', count: '450+' },
    { name: 'Agricultural Land', count: '1,750+' },
    { name: 'Commercial Properties', count: '900+' },
  ]

  return (
    <section className="pt-20 bg-white">
      <div className="mx-auto px-4 max-w-7xl">
        {/* Enhanced Services Grid - 4 columns on large screens */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Comprehensive Services
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              We combine technology, due diligence, market intelligence, and
              professional advisory to ensure every property you invest in is{' '}
              <span className="font-semibold">SAFE</span> and{' '}
              <span className="font-semibold">PROFITABLE.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className={`${service.color} rounded-2xl p-6 flex flex-col border border-neutral-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Icon */}
                <div
                  className={`flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-xl mb-4`}
                >
                  <service.icon className={`h-7 w-7 text-emerald-600`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>

                {/* Stats */}
                <p className="text-sm font-medium text-gray-500 mb-3">
                  {service.stats}
                </p>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Features */}
                {service.features && (
                  <ul className="mb-5 space-y-1">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-sm text-gray-500"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Button */}
                <Button
                  asChild
                  className={`w-full bg-[#0D2A52] hover:bg-[#061c3a] text-white py-3 mt-auto font-semibold rounded-lg h-11 text-sm transition-all duration-200`}
                >
                  <Link href={service.href}>{service.buttonText}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose PropSafe Hub?
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Founded by Tunde Oluwaniyi—an award-winning Executive Director
              with 10+ years of industry expertise— we&apos;re committed to
              solving real estate fraud and poor decision-making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="text-center bg-emerald-50 p-6 rounded-2xl"
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-4`}
                >
                  <value.icon className={`h-6 w-6 text-emerald-600`} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust & Credibility Section */}
        <div className="mb-20">
          <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-2xl p-12 text-white">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold mb-4">
                Trusted by Thousands of Investors
              </h3>
              <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                Join over 50,000 Nigerians who trust PropSafe Hub for secure,
                profitable real estate investments.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50K+</div>
                <div className="text-emerald-200">Happy Investors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">15K+</div>
                <div className="text-emerald-200">Properties Verified</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-emerald-200">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">10+</div>
                <div className="text-emerald-200">Years Expertise</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-emerald-100 mb-6">
                Ready to invest with confidence?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* For unauthenticated users */}
                {!isAuthenticated ? (
                  <>
                    <Button
                      asChild
                      className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg"
                    >
                      <Link href="/signup">Create Free Account</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-white bg-transparent hover:text-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-lg"
                    >
                      <Link href="#">Contact Our Team</Link>
                    </Button>
                  </>
                ) : (
                  /* For authenticated users - show relevant dashboard */
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {user?.userType === 'seller' && (
                      <Button
                        asChild
                        className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg"
                      >
                        <Link href="/dashboard">Seller Dashboard</Link>
                      </Button>
                    )}
                    {user?.userType === 'buyer' && (
                      <Button
                        asChild
                        className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg"
                      >
                        <Link href="/dashboard">My Investments</Link>
                      </Button>
                    )}
                    {user?.userType === 'agent' && (
                      <Button
                        asChild
                        className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg"
                      >
                        <Link href="/agent/dashboard">Agent Dashboard</Link>
                      </Button>
                    )}
                    {user?.userType === 'admin' && (
                      <Button
                        asChild
                        className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg"
                      >
                        <Link href="/admin/dashboard">Admin Dashboard</Link>
                      </Button>
                    )}
                    {/* Keep contact button for all authenticated users */}
                    <Button
                      asChild
                      className="border-white bg-emerald-600 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-lg"
                    >
                      <Link href="#">Contact Our Team</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
