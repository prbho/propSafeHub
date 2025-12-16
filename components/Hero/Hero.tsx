// components/Hero/Hero.tsx
'use client'

import { useEffect, useState } from 'react'

import HeroSearch from './HeroSearch'

export default function Hero() {
  const [searchType, setSearchType] = useState<'buy' | 'rent'>('buy')
  const [textIndex, setTextIndex] = useState(0)
  const [fade, setFade] = useState(true)

  // Text variations to cycle through
  const textVariations = [
    {
      title: 'Your Trusted Path to Secure, Verified Real Estate.',
      description:
        'Search verified property listings for sale and rent—diligently checked for your safety.',
    },
    {
      title: 'PropSafe Hub: The first of its kind in West Africa',
      // subtitle: 'The first of its kind in West Africa',
      description:
        'A secured real estate listing and investment platform built with embedded due diligence on property documentation before listing.',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out
      setFade(false)

      // After fade out completes, change text and fade back in
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % textVariations.length)
        setFade(true)
      }, 700) // Half of transition duration
    }, 5000) // Change text every 5 seconds

    return () => clearInterval(interval)
  }, [])

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

  const currentText = textVariations[textIndex]

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
          {/* Main Heading Section with Fade Transition */}
          <div className="mb-12 max-w-3xl mx-auto">
            {/* Simple Headline */}
            <div className="max-w-3xl mx-auto">
              <h1
                className={`text-3xl md:text-5xl font-bold mb-6 text-white leading-tight transition-all duration-500 ease-in-out ${
                  fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                {currentText.title}
              </h1>

              {/* Conditional subtitle for PropSafe Hub version */}
              {/* {currentText.subtitle && (
                <p
                  className={`text-2xl md:text-4xl font-bold mb-4 text-white leading-tight transition-all duration-500 ease-in-out delay-100 ${
                    fade
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  {currentText.subtitle}
                </p>
              )} */}
            </div>

            {/* Clean Subtitle */}
            <p
              className={`text-xl text-white/80 max-w-2xl mx-auto leading-relaxed transition-all duration-500 ease-in-out delay-200 ${
                fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {currentText.description}
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

          {/* Optional: Add indicator dots */}
          <div className="flex space-x-2 mt-8">
            {textVariations.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setFade(false)
                  setTimeout(() => {
                    setTextIndex(index)
                    setFade(true)
                  }, 500)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === textIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
