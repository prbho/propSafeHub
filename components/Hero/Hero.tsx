// components/Hero/Hero.tsx
'use client'

import { useState } from 'react'

import HeroSearch from './HeroSearch'

export default function Hero() {
  const [searchType, setSearchType] = useState<'buy' | 'rent'>('buy')

  const handleSearch = (query: string, type: 'buy' | 'rent') => {
    if (query.trim()) {
      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent('propertySearch', {
          detail: {
            q: query,
            status: type === 'buy' ? 'for-sale' : 'for-rent',
            page: 1,
          },
        })
      )

      // Scroll to properties section if on home page
      document.getElementById('properties-section')?.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="relative bg-linear-to-br from-[#0D2A52] via-[#0A1E3A] to-[#0D2A52] text-white overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-black/40">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80)',
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-10 lg:py-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-12 max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-emerald-600 block">
              Nigeria&apos;s Trusted Property Hub
            </h1>

            <p className="text-lg md:text-lg mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Discover verified properties across Nigeria. We are your trusted
              partner for safe, secure, and profitable real estate investments.
            </p>
          </div>

          {/* Search Section */}
          <div className="rounded-2xl p-6 md:pb-8 md:pt-1 md:px-6 mb-16 shadow-2xl border border-gray-200 backdrop-blur-sm bg-white/95 max-w-3xl mx-auto">
            {/* Search Tabs */}
            <div className="flex mb-6 border-b">
              <button
                onClick={() => setSearchType('buy')}
                className={`flex-1 py-4 font-semibold text-lg transition-all duration-300 ${
                  searchType === 'buy'
                    ? 'text-[#0D2A52] border-b-2 border-[#0FA36B]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🏠 Buy Property
              </button>
              <button
                onClick={() => setSearchType('rent')}
                className={`flex-1 py-4 font-semibold text-lg transition-all duration-300 ${
                  searchType === 'rent'
                    ? 'text-[#0D2A52] border-b-2 border-[#0FA36B]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🔑 Rent Property
              </button>
            </div>

            <HeroSearch searchType={searchType} onSearch={handleSearch} />
          </div>
        </div>
      </div>
    </section>
  )
}
