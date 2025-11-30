// components/Header/HeaderLoading.tsx
'use client'

import Link from 'next/link'
import { Search, Shield } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export default function HeaderLoading() {
  return (
    <div className="max-w-7xl mx-auto h-16 flex items-center">
      {/* Left Section (Logo + Search) */}
      <div className="flex items-center flex-1">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Shield className="h-36 w-12 text-gray-200 rounded animate-pulse" />
          <div className="grid space-y-1">
            <div className="flex space-x-1">
              <div className="h-4 w-18 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-2 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </Link>

        {/* Desktop Search - Hidden on loading */}
        <div className="hidden md:flex flex-1 mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search city, neighborhood, or ZIP..."
              className="pl-10 w-full"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Loading State for Desktop */}
      <div className="hidden md:flex items-center space-x-4 ml-auto">
        <div className="flex items-center space-x-6">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center space-x-2">
          <div className="h-9 w-30 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Loading State for Mobile */}
      <div className="md:hidden flex items-center">
        <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
