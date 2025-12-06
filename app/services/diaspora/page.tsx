'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  DollarSign,
  FileText,
  Home,
  MessageSquare,
  Shield,
  Video,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function DiasporaServicesPage() {
  const diasporaServices = [
    {
      title: 'Virtual Property Tours',
      icon: Video,
      description: 'Live video walkthroughs and drone footage of properties',
      features: [
        'Live Video Calls',
        'Drone Footage',
        'Neighborhood Tours',
        'Q&A Sessions',
      ],
    },
    {
      title: 'Digital Documentation',
      icon: FileText,
      description: 'Complete digital paperwork and legal processing',
      features: [
        'E-Signatures',
        'Digital Contracts',
        'Online Payments',
        'Secure Document Storage',
      ],
    },
    {
      title: 'Escrow Services',
      icon: Shield,
      description: 'Secure payment handling through trusted escrow partners',
      features: [
        'Milestone Payments',
        'Fund Protection',
        'Third-Party Verification',
        'Dispute Resolution',
      ],
    },
    {
      title: 'Property Management',
      icon: Home,
      description: 'Full property management for rental investments',
      features: [
        'Tenant Screening',
        'Rent Collection',
        'Maintenance',
        'Financial Reporting',
      ],
    },
  ]

  // const diasporaPackages = [
  //   {
  //     name: 'Basic',
  //     price: '₦200,000',
  //     description: 'For single property purchase',
  //     features: [
  //       'Virtual Property Tours',
  //       'Basic Due Diligence',
  //       'Document Review',
  //       'Payment Coordination',
  //     ],
  //     bestFor: 'First-time buyers',
  //   },
  //   {
  //     name: 'Premium',
  //     price: '₦350,000',
  //     description: 'Complete end-to-end service',
  //     features: [
  //       'Full Virtual Tours + Drone',
  //       'Comprehensive Verification',
  //       'Legal Representation',
  //       'Escrow Services',
  //       'Construction Monitoring',
  //       'Property Management Setup',
  //     ],
  //     bestFor: 'Serious investors',
  //     popular: true,
  //   },
  //   {
  //     name: 'Portfolio',
  //     price: 'Custom',
  //     description: 'Multiple property investments',
  //     features: [
  //       'Everything in Premium',
  //       'Portfolio Strategy',
  //       'Market Analysis',
  //       'Tax Advisory',
  //       'Dedicated Account Manager',
  //       'Regular Investment Reviews',
  //     ],
  //     bestFor: 'Seasoned investors',
  //   },
  // ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Diaspora Property Purchase Support
            </h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
              Invest in Nigerian real estate safely from anywhere in the world.
              Our dedicated diaspora team handles everything for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100 px-8"
              >
                <Link href="#start-process">Start Your Investment</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/schedule-meeting">Schedule Video Call</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">2,500+</div>
              <div className="text-emerald-200">Diaspora Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">15+</div>
              <div className="text-emerald-200">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">₦5B+</div>
              <div className="text-emerald-200">Investments Managed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">100%</div>
              <div className="text-emerald-200">Secure Transactions</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Our Diaspora Service Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A seamless 6-step process designed for international investors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: MessageSquare,
                title: 'Initial Consultation',
                description: 'Video call to understand your goals and budget',
              },
              {
                step: 2,
                icon: Video,
                title: 'Virtual Property Search',
                description: 'Curated property selection with virtual tours',
              },
              {
                step: 3,
                icon: Shield,
                title: 'Due Diligence',
                description:
                  'Comprehensive verification of selected properties',
              },
              {
                step: 4,
                icon: DollarSign,
                title: 'Secure Payment',
                description:
                  'Escrow services and international payment handling',
              },
              {
                step: 5,
                icon: FileText,
                title: 'Legal Processing',
                description: 'Digital documentation and title transfer',
              },
              {
                step: 6,
                icon: Home,
                title: 'Handover & Management',
                description: 'Property handover or management setup',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white p-8 rounded-2xl border shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl">
                    <span className="text-xl font-bold">{item.step}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <item.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Specialized Diaspora Services
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {diasporaServices.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border shadow-lg"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Diaspora Service Packages
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the package that fits your investment needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {diasporaPackages.map((pkg) => (
              <div
                key={pkg.name}
                className={`bg-white rounded-2xl p-8 border-2 ${
                  pkg.popular
                    ? 'border-emerald-600 shadow-xl relative'
                    : 'border-gray-200 shadow-lg'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {pkg.name}
                  </h3>
                  <div className="text-3xl font-bold text-emerald-600 mb-1">
                    {pkg.price}
                  </div>
                  <p className="text-gray-600 text-sm">{pkg.description}</p>
                </div>

                <div className="mb-8">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Best for: {pkg.bestFor}
                  </div>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  asChild
                  className={`w-full ${
                    pkg.popular
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  <Link
                    href={`/schedule-meeting?package=diaspora-${pkg.name.toLowerCase()}`}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Diaspora Investor FAQ
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'How do you handle international payments?',
                a: 'We work with registered escrow services and international payment platforms. You can pay in your local currency, and we handle the conversion securely.',
              },
              {
                q: 'Can I visit the property myself before buying?',
                a: 'Yes, we can arrange property visits with our representatives. We also provide comprehensive virtual tours for those who cannot travel.',
              },
              {
                q: 'How do you ensure the property is as shown in videos?',
                a: 'We conduct live video tours with you present, provide drone footage, and offer verified recent photos. All properties are physically inspected by our team.',
              },
              {
                q: 'What happens if there are legal issues after purchase?',
                a: 'Our legal team handles all documentation and provides post-purchase support. We also offer title insurance options for additional protection.',
              },
              {
                q: 'Can you help with property management after purchase?',
                a: 'Yes, we offer full property management services including tenant management, maintenance, and financial reporting.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
