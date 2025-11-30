import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'

import Chatbot from '@/components/chatbot/Chatbot'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { ToastProvider } from '@/components/ToastProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PropSafe Hub',
  description: 'Connecting you to safe investment',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <AuthProvider>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              }
            >
              <Header />
              {children}
              <Footer />
              <ToastProvider />
              <Chatbot />
            </Suspense>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
