// components/Header/NavigationLinks.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function NavigationLinks() {
  const { isAuthenticated } = useAuth()

  return (
    <nav className="flex items-center space-x-6">
      <Link
        href="/properties?type=buy"
        className="text-sm text-gray-700 hover:text-emerald-600 transition-colors"
      >
        Buy
      </Link>
      <Link
        href="/properties?type=rent"
        className="text-sm text-gray-700 hover:text-emerald-600 transition-colors"
      >
        Rent
      </Link>

      {/* Hide Sell link if user is authenticated */}
      {!isAuthenticated && (
        <Link
          href="/sell"
          className="text-sm text-gray-700 hover:text-emerald-600 transition-colors"
        >
          Sell
        </Link>
      )}

      <Link
        href="/agents"
        className="text-sm text-gray-700 hover:text-emerald-600 transition-colors"
      >
        Find Agents
      </Link>
    </nav>
  )
}
