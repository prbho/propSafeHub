'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { BarChart3, Home, Key, Shield, TrendingUp, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ServicesSection() {
  const { user, isAuthenticated } = useAuth()

  const services = [
    {
      id: 1,
      title: 'Buy a Home',
      description:
        'Find your perfect home with our extensive collection of verified listings and advanced search tools.',
      icon: Home,
      buttonText: 'Browse Homes',
      href: '/properties?type=buy',
      stats: '10,000+ Properties',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      id: 2,
      title: 'Sell a Home',
      description:
        'Maximize your property value with expert guidance, premium marketing, and competitive offers.',
      icon: TrendingUp,
      buttonText: 'List Property',
      href: '/list-property',
      stats: 'Get Top Market Value',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      id: 3,
      title: 'Rent a Home',
      description:
        'Discover high-quality rental properties with thoroughly verified listings and a secure, reliable application proces',
      icon: Key,
      buttonText: 'Find Rentals',
      href: '/properties?type=rent',
      stats: '5,000+ Rentals',
      color: 'bg-white border-gray-100',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  ]

  const features = [
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'Every property is thoroughly verified for authenticity',
    },
    {
      icon: Users,
      title: 'Expert Agents',
      description: 'Connect with trusted real estate professionals',
    },
    {
      icon: BarChart3,
      title: 'Market Insights',
      description: 'Make informed decisions with real-time data',
    },
  ]

  return (
    <section className="pt-20 bg-white">
      <div>
        <div className="mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Real Estate Journey Starts Here
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Whether you&aposre buying, selling, or renting, we provide the
              tools and expertise to make your real estate experience seamless
              and successful.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service) => (
              <div
                key={service.id}
                className={`${service.color} rounded-2xl p-8 border shadow-sm hover:shadow-md transition-shadow`}
              >
                {/* Icon */}
                <div
                  className={`flex items-center justify-center w-16 h-16 ${service.iconBg} rounded-xl mb-6`}
                >
                  <service.icon className={`h-8 w-8 ${service.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>

                {/* Stats */}
                <p className="text-sm font-medium text-gray-500 mb-4">
                  {service.stats}
                </p>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Button */}
                <Button
                  asChild
                  className="w-full bg-secondary py-4 font-semibold rounded-lg
                  h-12
                  text-base transition-all duration-200
                  "
                >
                  <Link href={service.href}>{service.buttonText}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-emerald-50 rounded-2xl p-12 mb-16 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose PropSafeHub?
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We&aposre committed to making real estate transactions secure,
              transparent, and efficient for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-6 text-white pt-20">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-3xl font-bold mb-2">
                Ready to Move Forward?
              </h3>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Join over thousands of Nigerians who trust PropSafeHub for their
                real estate needs. Get started today and experience the
                difference.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* For unauthenticated users */}
                {!isAuthenticated ? (
                  <>
                    <Button
                      asChild
                      className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg h-12"
                    >
                      <Link href="/signup">Create Free Account</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-white bg-transparent h-12 text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-lg"
                    >
                      <Link href="/properties">Browse Properties</Link>
                    </Button>
                  </>
                ) : (
                  /* For authenticated users - show relevant dashboard */
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {user?.userType === 'seller' && (
                      <Button
                        asChild
                        className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg h-12"
                      >
                        <Link href="/dashboard">Seller Dashboard</Link>
                      </Button>
                    )}
                    {user?.userType === 'agent' && (
                      <Button
                        asChild
                        className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg h-12"
                      >
                        <Link href="/agent/dashboard">Agent Dashboard</Link>
                      </Button>
                    )}
                    {user?.userType === 'admin' && (
                      <Button
                        asChild
                        className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg h-12"
                      >
                        <Link href="/admin/dashboard">Admin Dashboard</Link>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      className="border-emerald-100 bg-emerald-100 h-12  hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-lg"
                    >
                      <Link href="/properties">Browse Properties</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 pt-8 border-t border-emerald-300">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">
                      50K+
                    </div>
                    <div className="text-emerald-200 text-sm">Happy Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">
                      15K+
                    </div>
                    <div className="text-emerald-200 text-sm">
                      Properties Listed
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">
                      200+
                    </div>
                    <div className="text-emerald-200 text-sm">
                      Expert Agents
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">
                      98%
                    </div>
                    <div className="text-emerald-200 text-sm">
                      Satisfaction Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
