// app/sell/page.tsx
'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  DollarSign,
  FileText,
  Shield,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SellPage() {
  const features = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Maximize Your Price',
      description:
        'Get the best possible price for your property with our market analysis and pricing tools.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Market Insights',
      description:
        'Access real-time market data and comparable properties to make informed decisions.',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Targeted Exposure',
      description:
        'Reach thousands of serious buyers actively searching for properties like yours.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure Process',
      description:
        'Safe and secure transaction process with verified buyers and professional guidance.',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'List Your Property',
      description:
        'Create your listing with photos, details, and pricing in minutes.',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      number: '02',
      title: 'Get Market Exposure',
      description:
        'Your property appears across our platform and partner networks.',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      number: '03',
      title: 'Receive Offers',
      description: 'Connect with interested buyers and review offers directly.',
      icon: <Users className="h-5 w-5" />,
    },
    {
      number: '04',
      title: 'Close the Deal',
      description:
        'Complete the sale with our support and secure payment processing.',
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ]

  const stats = [
    { number: '67%', label: 'Faster Sale Time' },
    { number: '15%', label: 'Higher Sale Price' },
    { number: '10,000+', label: 'Active Buyers' },
    { number: '98%', label: 'Seller Satisfaction' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <div className="relative container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Sell Your Home
              <span className="block mt-2 bg-linear-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                Smarter, Faster
              </span>
            </h1>

            <p className="md:text-xl mb-10 text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Get the best price for your property with Nigeria&apos;s most
              trusted real estate platform. Join thousands of successful
              sellers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                asChild
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-base px-8 py-6 rounded-lg shadow-lg shadow-emerald-500/20"
              >
                <Link href="/list-property">
                  List Your Property Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white/20 text-black hover:bg-white/90 backdrop-blur-sm text-base px-8 py-6 rounded-lg"
              >
                <Link href="#how-it-works">Learn How It Works</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="text-xl lg:text-4xl font-bold mb-2 text-white">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-emerald-600 font-semibold text-sm tracking-wider uppercase">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Why Sell with PropSafeHub?
            </h2>
            <p className="md:text-lg text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to sell your property quickly and
              for the best price.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all group"
              >
                <CardContent className="p-8">
                  <div className="w-12 h-12 mx-auto bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-5 group-hover:bg-emerald-100 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-emerald-600 font-semibold text-sm tracking-wider uppercase">
                Simple Process
              </span>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Selling your property has never been easier. Follow these simple
              steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-emerald-200 to-gray-200" />
                )}

                <div className="relative">
                  <div className="w-20 h-20 bg-linear-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                    {step.number}
                  </div>

                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mx-auto mb-4">
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-linear-to-br from-emerald-600 via-emerald-500 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 text-white">
              Ready to Sell Your Property?
            </h2>
            <p className="text-lg md:text-xl mb-10 text-emerald-50 max-w-2xl mx-auto leading-relaxed">
              Join thousands of successful sellers who trusted PropSafeHub to
              get the best price for their property.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-50 text-base px-8 py-6 rounded-lg shadow-xl"
              >
                <Link href="/list-property">
                  Start Listing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm text-base px-8 py-6 rounded-lg"
              >
                <Link href="/contact">Speak with an Agent</Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-emerald-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>No listing fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Professional photography</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Market analysis included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
              Start Your Selling Journey Today
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Don&apos;t wait to get the best price for your property. List now
              and connect with serious buyers.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-base px-8 py-6 rounded-lg shadow-lg shadow-emerald-600/20"
            >
              <Link href="/list-property">
                List Your Property Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
