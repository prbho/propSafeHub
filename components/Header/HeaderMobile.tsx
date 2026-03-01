// components/Header/HeaderMobile.tsx
'use client'

import { useEffect, useState } from 'react'
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
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    const handleSheetClose = () => setIsSheetOpen(false)
    document.addEventListener('sheet-close', handleSheetClose)
    return () => {
      document.removeEventListener('sheet-close', handleSheetClose)
    }
  }, [])

  return (
    <div className="md:hidden flex max-w-7xl mx-auto h-16 items-center justify-between px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          width={150}
          height={64}
          src="/logo.png"
          alt="PropSafe Hub"
          className="h-15 w-auto"
        />
      </Link>

      {/* Mobile Menu Button */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          {isSheetOpen ? (
            <MobileNavContent
              openAuth={openAuth}
              isAuthenticated={isAuthenticated}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
