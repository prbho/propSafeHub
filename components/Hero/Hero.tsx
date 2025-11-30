// components/Hero/Hero.tsx
'use client'

import { useState } from 'react'

import HeroSearch from './HeroSearch'

export default function Hero() {
  const [searchType, setSearchType] = useState<'buy' | 'rent'>('buy')

  const handleSearch = (query: string, type: 'buy' | 'rent') => {
    if (query.trim()) {
      window.dispatchEvent(
        new CustomEvent('propertySearch', {
          detail: {
            q: query,
            status: type === 'buy' ? 'for-sale' : 'for-rent',
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
    <section className="relative bg-black min-h-[70vh] flex items-center justify-center border-b border-gray-200">
      {/* Clean Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: 'url(/luxury-home.jpg)',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Main Heading Section */}
          <div className="mb-12 max-w-3xl mx-auto">
            {/* Simple Headline */}
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                Find your perfect home in Nigeria
              </h1>
            </div>
            {/* Clean Subtitle */}
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Search thousands of verified properties for sale and rent across
              Nigeria&quot;s top cities
            </p>
          </div>

          {/* Search Section - Clean and Professional */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              {/* Simple Search Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setSearchType('buy')}
                  className={`flex-1 py-5 px-6 font-semibold text-lg transition-colors duration-200 rounded-tl-lg ${
                    searchType === 'buy'
                      ? 'border-b-4 border-emerald-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setSearchType('rent')}
                  className={`flex-1 py-5 px-6 font-semibold text-lg transition-colors duration-200 rounded-tr-lg ${
                    searchType === 'rent'
                      ? 'border-b-4 border-emerald-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Rent
                </button>
              </div>

              {/* Search Component */}
              <div className="p-6">
                <HeroSearch searchType={searchType} onSearch={handleSearch} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
