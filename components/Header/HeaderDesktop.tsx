// components/Header/HeaderDesktop.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

import { Separator } from '@/components/ui/separator'

import HeaderSearch from './HeaderSearch'
import NavigationLinks from './NavigationLinks'
import UserDropdown from './UserDropdown'

interface HeaderDesktopProps {
  isAuthModalOpen: boolean
  setIsAuthModalOpen: (open: boolean) => void
  openAuth: () => void
}

export default function HeaderDesktop({ openAuth }: HeaderDesktopProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="hidden md:flex max-w-7xl mx-auto h-16 items-center">
      {/* Left Section (Logo + Search) */}
      <div className="flex items-center flex-1">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            width={250}
            height={200}
            src="/logo.png"
            alt="PropSafe Hub"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Search */}
        <div className="flex flex-1 mx-8">
          <HeaderSearch />
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="flex items-center space-x-4 ml-auto">
        <NavigationLinks />

        <Separator orientation="vertical" className="h-6" />

        {isAuthenticated ? (
          <UserDropdown />
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={openAuth}
              className="bg-[#0D2A52] hover:bg-[#061c3a] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login / Register
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
