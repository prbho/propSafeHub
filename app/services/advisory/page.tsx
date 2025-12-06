'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DollarSign, Shield, TrendingUp, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function InvestmentAdvisoryPage() {
  const [investmentGoal, setInvestmentGoal] = useState('')

  const investmentGoals = [
    {
      type: 'capital-appreciation',
      title: 'Capital Appreciation',
      description: 'Focus on properties with high growth potential',
      timeline: '3-5 years',
      risk: 'Medium-High',
    },
    {
      type: 'rental-income',
      title: 'Rental Income',
      description: 'Generate consistent monthly cash flow',
      timeline: 'Long-term',
      risk: 'Low-Medium',
    },
    {
      type: 'portfolio-diversification',
      title: 'Portfolio Diversification',
      description: 'Add real estate to your investment mix',
      timeline: '5+ years',
      risk: 'Low',
    },
    {
      type: 'land-banking',
      title: 'Land Banking',
      description: 'Strategic land acquisition for future development',
      timeline: '5-10 years',
      risk: 'Medium',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              PropSafe Consult™
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Professional investment advisory to maximize your real estate
              returns while minimizing risks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-gray-100 px-8"
              >
                <Link href="#get-started">Book Consultation</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/properties">View Investment Properties</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Approach */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our 4-Pillar Advisory Approach
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine market intelligence, technical analysis, and strategic
              planning for optimal results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Market Intelligence',
                description:
                  'Real-time data on property values, rental yields, and market trends',
              },
              {
                icon: Shield,
                title: 'Risk Management',
                description:
                  'Comprehensive risk assessment and mitigation strategies',
              },
              {
                icon: DollarSign,
                title: 'Financial Modeling',
                description:
                  'ROI projections, cash flow analysis, and investment simulations',
              },
              {
                icon: Users,
                title: 'Personalized Strategy',
                description:
                  'Custom investment plans based on your goals and risk tolerance',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border shadow-sm"
              >
                <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-lg mb-4">
                  <item.icon className="h-6 w-6" />
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
      {/* <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advisory Services
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {advisoryServices.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border shadow-lg"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {service.title}
                    </h3>
                    <div className="text-blue-600 font-semibold">
                      {service.price}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{service.description}</p>

                <ul className="space-y-2 mb-8">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Link
                    href={`/schedule-meeting?service=${service.title.toLowerCase().replace(' ', '-')}`}
                  >
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Investment Goals */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Define Your Investment Goals
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Different goals require different strategies. Tell us what you
              want to achieve.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {investmentGoals.map((goal) => (
              <button
                key={goal.type}
                onClick={() => setInvestmentGoal(goal.type)}
                className={`p-6 rounded-xl text-left transition-all ${
                  investmentGoal === goal.type
                    ? 'border-2 border-blue-600 bg-blue-50'
                    : 'border border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {goal.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Timeline: {goal.timeline}
                  </span>
                  <span className="text-gray-500">Risk: {goal.risk}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
