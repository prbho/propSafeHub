// components/Header/HeaderMobile.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import MobileNavContent from './MobileNavContent'

interface HeaderMobileProps {
  isAuthModalOpen: boolean
  setIsAuthModalOpen: (open: boolean) => void
  openAuth: () => void
}

export default function HeaderMobile({ openAuth }: HeaderMobileProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="md:hidden flex max-w-7xl mx-auto h-16 items-center justify-between px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          width={160}
          height={32}
          src="/logo.png"
          alt="PropSafe Hub"
          className="h-6 w-auto"
        />
      </Link>

      {/* Mobile Menu Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <MobileNavContent
            openAuth={openAuth}
            isAuthenticated={isAuthenticated}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
