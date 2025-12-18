'use client'

import React, { useState } from 'react'
import {
  Calendar,
  FileCheck,
  Globe,
  Handshake,
  Home,
  Link,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// FAQ Data Types
interface FAQItem {
  id: number
  question: string
  answer: React.ReactNode
  category: string
  tags?: string[]
}

// FAQ Data
const faqData: FAQItem[] = [
  // General Questions
  {
    id: 1,
    question: 'What is PropSafe Hub?',
    answer:
      'PropSafe Hub is a trusted real estate platform dedicated to helping individuals, families, and investors buy authentic, verified, and future-proof properties with complete peace of mind. We combine technology, due diligence, market intelligence, and professional advisory to ensure every property you invest in is SAFE and PROFITABLE.',
    category: 'General',
    tags: ['About', 'Overview'],
  },
  {
    id: 2,
    question: 'Who founded PropSafe Hub?',
    answer:
      'PropSafe Hub was founded by Tunde Oluwaniyi, an award-winning Executive Director/COO with over 9 years of expertise in real estate, construction, project management, and business development.',
    category: 'General',
    tags: ['Leadership', 'Founder'],
  },
  {
    id: 3,
    question:
      'What makes PropSafe Hub different from other real estate platforms?',
    answer: (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <strong className="text-gray-900">Zero Hidden Risks:</strong>
            <span className="text-gray-700">
              {' '}
              We ensure complete transparency in all transactions
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FileCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <strong className="text-gray-900">
              100% Verified Documentation:
            </strong>
            <span className="text-gray-700">
              {' '}
              All properties undergo rigorous verification checks
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Home className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <strong className="text-gray-900">Professional Advisory:</strong>
            <span className="text-gray-700">
              Guidance from industry experts with deep market knowledge
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Handshake className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <strong className="text-gray-900">
              Top Developer Partnerships:
            </strong>
            <span className="text-gray-700">
              Working exclusively with reputable developers
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 flex items-center justify-center bg-emerald-600 text-white rounded text-xs font-bold mt-0.5 shrink-0">
            ✓
          </div>
          <div>
            <strong className="text-gray-900">Digital-First Process:</strong>
            <span className="text-gray-700">
              Fast, transparent, and secure online procedures
            </span>
          </div>
        </div>
      </div>
    ),
    category: 'General',
    tags: ['Benefits', 'Advantages'],
  },

  // Services Questions
  {
    id: 4,
    question: 'What services does PropSafe Hub offer?',
    answer: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 p-4 rounded-lg bg-white">
            <h4 className="font-semibold text-gray-900 mb-1">
              Verified Property Listings
            </h4>
            <p className="text-sm text-gray-600">
              Curated properties that pass multi-stage verification
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg bg-white">
            <h4 className="font-semibold text-gray-900 mb-1">
              Property Verification & Title Check
            </h4>
            <p className="text-sm text-gray-600">
              Document authentication and site verification
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg bg-white">
            <h4 className="font-semibold text-gray-900 mb-1">
              Real Estate Investment Advisory
            </h4>
            <p className="text-sm text-gray-600">
              Personalized investment strategies and planning
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg bg-white">
            <h4 className="font-semibold text-gray-900 mb-1">
              Diaspora Property Support
            </h4>
            <p className="text-sm text-gray-600">
              Virtual inspections and secure escrow for overseas buyers
            </p>
          </div>
        </div>
      </div>
    ),
    category: 'Services',
    tags: ['Offerings', 'Solutions'],
  },
  {
    id: 5,
    question: 'How does the PropSafe Score™ work?',
    answer:
      "The PropSafe Score™ is our proprietary scoring system (1-100) that rates each property based on: Documentation strength (25%), Developer track record (20%), Security (15%), Infrastructure (20%), and Appreciation potential (20%). Properties with scores above 80 receive our 'Premium Verified' badge, offering greater investment security.",
    category: 'Services',
    tags: ['Verification', 'Scoring'],
  },

  // Properties Questions
  {
    id: 6,
    question: 'What types of properties are available on PropSafe Hub?',
    answer: (
      <div className="space-y-3">
        <p className="text-gray-700">
          We offer a wide range of verified properties across Nigeria:
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Serviced Plots
          </Badge>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Ready-to-build Land
          </Badge>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Luxury Homes
          </Badge>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Affordable Housing
          </Badge>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Waterfront Properties
          </Badge>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Agricultural/Investment Plots
          </Badge>
        </div>
        <p className="text-gray-700 text-sm">
          Each listing includes verified title, developer profile, AI scoring,
          neighborhood analysis, payment plans, and ROI projections.
        </p>
      </div>
    ),
    category: 'Properties',
    tags: ['Listings', 'Inventory'],
  },

  // Verification Questions
  {
    id: 7,
    question: 'Can I verify a property not listed on PropSafe Hub?',
    answer:
      "Yes! Our PropSafe Verify™ service is available for any property, even if it's not listed with us. We conduct document authentication, site verification, government acquisition status checks, and community assessment. Contact our verification team for a custom quote based on the property location and type.",
    category: 'Verification',
    tags: ['Check', 'Authentication'],
  },
  {
    id: 8,
    question: 'What documents do you verify during property checks?',
    answer: (
      <div className="space-y-3">
        <p className="text-gray-700">
          We verify all essential documents to ensure legal compliance:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-1">•</span>
            <span>Certificate of Occupancy (C of O)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-1">•</span>
            <span>Excision documents and Gazette publications</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-1">•</span>
            <span>Deed of Assignment or Transfer</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-1">•</span>
            <span>Survey plans and beacons</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-1">•</span>
            <span>Governor&apos;s consent (where applicable)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-1">•</span>
            <span>Development permits and approvals</span>
          </li>
        </ul>
        <p className="text-sm text-gray-600 pt-2 border-t border-gray-200">
          We also check for encumbrances, disputes, and community agreements.
        </p>
      </div>
    ),
    category: 'Verification',
    tags: ['Documents', 'Legal'],
  },

  // Diaspora Questions
  {
    id: 9,
    question: 'How can I invest in Nigerian real estate from abroad?',
    answer: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Our Diaspora Property Purchase Support makes investing from overseas
          seamless:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Globe className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Virtual Inspections
              </h4>
              <p className="text-sm text-gray-600">
                Live video tours with our agents on-site
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-emerald-100 p-2 rounded-lg flex items-center justify-center">
              <span className="font-bold text-emerald-700">✓</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Secure Escrow Payments
              </h4>
              <p className="text-sm text-gray-600">
                Funds held securely until all conditions are met
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <FileCheck className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Digital Documentation
              </h4>
              <p className="text-sm text-gray-600">
                Complete paperwork online with e-signatures
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    category: 'Diaspora',
    tags: ['Overseas', 'International'],
  },

  // Mortgage Questions
  {
    id: 10,
    question: 'Do you offer mortgage financing options?',
    answer:
      'Yes, PropSafe Hub partners with reputable financial institutions to offer exclusive mortgage access. We work with Primary Mortgage Banks, Commercial Banks, and Cooperative Housing Schemes, including Federal Housing/National Housing Fund (NHF) Mortgages. Our mortgage advisors guide you through eligibility, documentation, and the entire application process.',
    category: 'Mortgage',
    tags: ['Financing', 'Loans'],
  },
  {
    id: 11,
    question: 'Who qualifies for your mortgage plans?',
    answer:
      'Our mortgage plans are available for salaried workers (minimum 2 years employment), business owners (with 3+ years financial records), first-time home buyers, diaspora investors with verifiable income, and corporate investors. We offer flexible payment tenures from 5-30 years based on eligibility and property type.',
    category: 'Mortgage',
    tags: ['Eligibility', 'Requirements'],
  },

  // Partnership Questions
  {
    id: 12,
    question: 'Can developers partner with PropSafe Hub?',
    answer:
      'Yes, we actively partner with reputable developers. Benefits include: listing on our verified platform, credibility enhancement through our verification badge, access to our investor network (including diaspora), improved sales conversion, and marketing support. Developers must pass our due diligence process before partnership.',
    category: 'Partnership',
    tags: ['Developers', 'Collaboration'],
  },
  {
    id: 13,
    question: 'How do I book a free consultation?',
    answer: (
      <div className="space-y-4">
        <p className="text-gray-700">
          You can book a free consultation through multiple channels:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            asChild
          >
            <a href="/schedule-meeting">
              <Calendar className="mr-2 h-4 w-4" />
              Online Booking
            </a>
          </Button>
          <Button
            variant="outline"
            className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            asChild
          >
            <a href="tel:+2349023558992">
              <Phone className="mr-2 h-4 w-4" />
              Call +234 704 800 0553
            </a>
          </Button>
        </div>
        <p className="text-sm text-gray-600 pt-2 border-t border-gray-200">
          Or email us at propsafehub@gmail.com - we typically respond within 24
          hours.
        </p>
      </div>
    ),
    category: 'General',
    tags: ['Contact', 'Support'],
  },
]

// Category tabs data
const categoryTabs = [
  { value: 'all', label: 'All Questions' },
  { value: 'general', label: 'General' },
  { value: 'services', label: 'Services' },
  { value: 'properties', label: 'Properties' },
  { value: 'verification', label: 'Verification' },
  { value: 'diaspora', label: 'Diaspora' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'partnership', label: 'Partnership' },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Filter FAQs based on search and active tab
  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      faq.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesTab =
      activeTab === 'all' || faq.category.toLowerCase() === activeTab

    return matchesSearch && matchesTab
  })

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'general':
        return (
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
            <span className="text-blue-700 font-semibold text-lg">?</span>
          </div>
        )
      case 'services':
        return (
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
          </div>
        )
      case 'properties':
        return (
          <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
            <Home className="h-5 w-5 text-orange-700" />
          </div>
        )
      case 'verification':
        return (
          <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
            <FileCheck className="h-5 w-5 text-purple-700" />
          </div>
        )
      case 'diaspora':
        return (
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
            <Globe className="h-5 w-5 text-blue-700" />
          </div>
        )
      case 'mortgage':
        return (
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <span className="text-emerald-700 font-bold text-lg">₦</span>
          </div>
        )
      case 'partnership':
        return (
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <Handshake className="h-5 w-5 text-indigo-700" />
          </div>
        )
      default:
        return <span>•</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-emerald-800 text-white">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-10 leading-relaxed">
              Find answers to common questions about PropSafe Hub services,
              property verification, and real estate investment processes.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search for answers (e.g., 'verification', 'mortgage', 'diaspora')"
                className="pl-14 py-7 rounded-lg border-2 border-transparent focus:border-emerald-300 shadow-lg text-base bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Category Tabs */}
        <div className="mb-12">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">
                Browse by Category
              </h2>
              <div className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                {filteredFAQs.length}{' '}
                {filteredFAQs.length === 1 ? 'question' : 'questions'}
              </div>
            </div>

            <TabsList className="flex flex-wrap h-auto p-2 bg-white rounded-lg border border-gray-200 mb-10 shadow-sm">
              {categoryTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md px-5 py-2.5 flex-1 md:flex-none font-medium text-gray-700"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* FAQ Accordion */}
            <div>
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="overflow-hidden rounded-2xl border hover:border-emerald-300 bg-white"
                    >
                      <AccordionItem
                        value={`item-${faq.id}`}
                        className="border-0"
                      >
                        <AccordionTrigger className="px-6 py-6 hover:no-underline hover:bg-white data-state=open:bg-gray-50">
                          <div className="flex items-start gap-4 text-left w-full">
                            {getCategoryIcon(faq.category)}
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-2 leading-snug">
                                {faq.question}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {faq.category}
                                </Badge>
                                {faq.tags?.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs font-medium border-gray-300 text-gray-600"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-0">
                          <div className="ml-14">
                            <Separator className="mb-5" />
                            <div className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </div>
                  ))}
                </Accordion>
              ) : (
                <Card className="p-16 text-center border-2 border-gray-200 bg-white">
                  <div className="mx-auto max-w-md">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      No matching questions found
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Try searching with different keywords or browse by
                      category
                    </p>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      size="lg"
                      onClick={() => {
                        setSearchQuery('')
                        setActiveTab('all')
                      }}
                    >
                      View All Questions
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </Tabs>
        </div>

        {/* Contact CTA Section */}
        <div className="mt-20 mb-8">
          <div className=" bg-white overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-10 md:p-14">
              <div className="grid md:grid-cols-3 gap-10 items-center">
                <div className=" col-span-2">
                  <h2 className="text-xl md:text-2xl mb-5 text-gray-900 font-bold">
                    Still Have Questions?
                  </h2>
                  <p className="text-gray-700 mb-8 leading-relaxed">
                    Our expert team is ready to provide personalized answers and
                    guide you through your real estate journey. Get in touch for
                    a free consultation.
                  </p>

                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Phone className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          Call Us
                        </p>
                        <p className="text-gray-700"> +234 704 800 0553</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Mail className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          Email Us
                        </p>
                        <p className="text-gray-700">info@propsafehub.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                        <MapPin className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          Visit Us
                        </p>
                        <p className="text-gray-700">
                          50, Emerald Avenue, Sangotedo, Ajah, Lagos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full h-14 text-base bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <a href="/schedule-meeting">
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Free Consultation
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-14 text-base border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    asChild
                  >
                    <Link href="/properties">
                      <Home className="mr-2 h-5 w-5" />
                      Browse Verified Properties
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-14 text-base border-2 border-gray-300 hover:bg-gray-50"
                    asChild
                  >
                    <a href="/contact">
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      Request Property Verification
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
