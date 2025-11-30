'use client'

import { useState } from 'react'
import { Home, Search, Shield, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'buy' | 'rent'>('buy')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.dispatchEvent(
        new CustomEvent('propertySearch', {
          detail: {
            city: searchQuery,
            status: searchType === 'buy' ? 'for-sale' : 'for-rent',
            page: 1,
          },
        })
      )
      document.getElementById('properties-section')?.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="relative bg-linear-to-br from-[#0D2A52] via-[#0A1E3A] to-[#0D2A52] text-white">
      <div className="absolute inset-0 bg-black/40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa')] bg-cover bg-center opacity-20" />
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Find Safe & Secure
            <span className="text-[#0FA36B]"> Properties</span>
          </h1>

          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Explore verified properties across Nigeria. Your trusted hub for
            safe and secure real estate investments.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-3 md:p-8 mb-8 shadow-xl border border-gray-200">
            {/* Search Tabs */}
            <div className="flex mb-6 border-b">
              <button
                onClick={() => setSearchType('buy')}
                className={`flex-1 py-3 font-semibold text-base ${
                  searchType === 'buy'
                    ? 'text-[#0D2A52] border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSearchType('rent')}
                className={`flex-1 py-3 font-semibold ${
                  searchType === 'rent'
                    ? 'text-[#0D2A52] border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-sm">Rent</span>
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search city or neighborhood..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 h-14 text-lg border-gray-300 focus:border-[#0FA36B]"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-emerald-600 px-6 hover:emerald-700 text-white py-3 h-14 text-base font-semibold rounded-md shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Search className="h-5 w-5 mr-2" /> Search
                </Button>
              </div>
            </form>

            {/* Quick Search */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <span className="text-gray-500 text-sm">Popular:</span>
              {[
                'Lekki',
                'Victoria Island',
                'Ikeja',
                'Abuja',
                'Port Harcourt',
              ].map((location) => (
                <button
                  key={location}
                  onClick={() => setSearchQuery(location)}
                  className="text-[#0D2A52] hover:text-[#0FA36B] text-sm font-medium px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/10 rounded-full p-3 inline-flex mb-3">
                <Home className="h-6 w-6 text-[#0FA36B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">10,000+ Properties</h3>
              <p className="text-gray-300">Across major Nigerian cities</p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full p-3 inline-flex mb-3">
                <Shield className="h-6 w-6 text-[#0FA36B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
              <p className="text-gray-300">Safe & trusted investments</p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 rounded-full p-3 inline-flex mb-3">
                <TrendingUp className="h-6 w-6 text-[#0FA36B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Market Insights</h3>
              <p className="text-gray-300">Stay ahead with real-time data</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
