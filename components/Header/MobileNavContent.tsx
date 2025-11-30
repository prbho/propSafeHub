// components/Header/MobileNavContent.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Heart, Shield } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import NotificationBell from '../NotificationBell'
import HeaderSearch from './HeaderSearch'

interface MobileNavContentProps {
  openAuth: () => void
  isAuthenticated: boolean
}

export default function MobileNavContent({
  openAuth,
  isAuthenticated,
}: MobileNavContentProps) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    document.dispatchEvent(new Event('sheet-close'))
  }

  const closeSheet = () => {
    document.dispatchEvent(new Event('sheet-close'))
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Mobile Search */}
      <HeaderSearch />

      {/* Mobile Nav Links */}
      <nav className="flex flex-col space-y-4">
        <Link
          href="/properties?type=buy"
          className="text-lg font-medium text-gray-900 hover:text-emerald-600 transition-colors"
          onClick={closeSheet}
        >
          Buy
        </Link>
        <Link
          href="/properties?type=rent"
          className="text-lg font-medium text-gray-900 hover:text-emerald-600 transition-colors"
          onClick={closeSheet}
        >
          Rent
        </Link>
        <Link
          href="/sell"
          className="text-lg font-medium text-gray-900 hover:text-emerald-600 transition-colors"
          onClick={closeSheet}
        >
          Sell
        </Link>
        <Link
          href="/agents"
          className="text-lg font-medium text-gray-900 hover:text-emerald-600 transition-colors"
          onClick={closeSheet}
        >
          Find Agents
        </Link>

        {isAuthenticated && (
          <Link
            href="/favorites"
            className="flex items-center space-x-2 text-lg font-medium text-gray-900 hover:text-emerald-600 transition-colors"
            onClick={closeSheet}
          >
            <Heart className="h-4 w-4" />
            <span>Favorites</span>
          </Link>
        )}
      </nav>

      <Separator />

      {/* Auth / Profile Section */}
      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-blue-100 text-emerald-600 text-lg">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {!user?.emailVerified && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Verify your email
                </p>
              )}
            </div>
          </div>

          {/* Mobile Notification Bell */}
          <div className="flex justify-center">
            <NotificationBell />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/profile" onClick={closeSheet}>
                My Profile
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/list-property" onClick={closeSheet}>
                List Property
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard" onClick={closeSheet}>
                Dashboard
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/my-properties" onClick={closeSheet}>
                My Properties
              </Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <Button
            className="w-full bg-emerald-600 hover:bg-blue-700"
            onClick={() => {
              openAuth()
              closeSheet()
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              openAuth()
              closeSheet()
            }}
          >
            Sign Up
          </Button>
        </div>
      )}
    </div>
  )
}
