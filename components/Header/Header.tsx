// components/Header/index.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useState } from 'react'

import { useAuth } from '../../contexts/AuthContext'
import AuthModal from '../AuthModal'
import HeaderDesktop from './HeaderDesktop'
import HeaderLoading from './HeaderLoading'
import HeaderMobile from './HeaderMobile'

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const auth = useAuth()

  const openAuth = () => setIsAuthModalOpen(true)

  // Use type assertion as temporary fix
  const isLoading = (auth as any).isLoading

  if (isLoading) {
    return <HeaderLoading />
  }

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-50">
        <HeaderDesktop
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
          openAuth={openAuth}
        />
        <HeaderMobile
          isAuthModalOpen={isAuthModalOpen}
          setIsAuthModalOpen={setIsAuthModalOpen}
          openAuth={openAuth}
        />
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  )
}
