'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

import { Button } from '@/components/ui/button'

interface TrustCredibilitySectionProps {
  className?: string
  title?: string
  description?: string
}

export default function TrustCredibilitySection({
  className = '',
  title = 'Trusted by Thousands of Investors',
  description = 'Join over 50,000 Nigerians who trust PropSafe Hub for secure, profitable real estate investments.',
}: TrustCredibilitySectionProps) {
  const { user, isAuthenticated } = useAuth()

  return (
    <div
      className={`mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 ${className}`}
    >
      <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 md:p-12 text-white">
        <div className="text-center mb-8 md:mb-10">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">{title}</h3>
          <p className="text-emerald-100 text-base md:text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-10">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">50K+</div>
            <div className="text-emerald-200 text-sm md:text-base">
              Happy Investors
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">15K+</div>
            <div className="text-emerald-200 text-sm md:text-base">
              Properties Verified
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
            <div className="text-emerald-200 text-sm md:text-base">
              Satisfaction Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">10+</div>
            <div className="text-emerald-200 text-sm md:text-base">
              Years Expertise
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-emerald-100 mb-6">
            Ready to invest with confidence?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* For unauthenticated users */}
            {!isAuthenticated ? (
              <>
                <Button
                  asChild
                  className="bg-white text-emerald-700 hover:bg-gray-100 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg"
                >
                  <Link href="/signup">Create Free Account</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white bg-transparent hover:text-white text-white hover:bg-white/10 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg"
                >
                  <Link href="/contact">Contact Our Team</Link>
                </Button>
              </>
            ) : (
              /* For authenticated users - show relevant dashboard */
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user?.userType === 'seller' && (
                  <Button
                    asChild
                    className="bg-white text-emerald-700 hover:bg-gray-100 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg"
                  >
                    <Link href="/dashboard">Seller Dashboard</Link>
                  </Button>
                )}
                {user?.userType === 'buyer' && (
                  <Button
                    asChild
                    className="bg-white text-emerald-700 hover:bg-gray-100 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg"
                  >
                    <Link href="/dashboard">My Investments</Link>
                  </Button>
                )}
                {user?.userType === 'agent' && (
                  <Button
                    asChild
                    className="bg-white text-emerald-700 hover:bg-gray-100 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg"
                  >
                    <Link href={`/dashboard/${user?.userType}/${user?.$id}`}>
                      Agent Dashboard
                    </Link>
                  </Button>
                )}
                {user?.userType === 'admin' && (
                  <Button
                    asChild
                    className="bg-white text-emerald-700 hover:bg-gray-100 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg"
                  >
                    <Link href="/admin/dashboard">Admin Dashboard</Link>
                  </Button>
                )}
                {/* Keep contact button for all authenticated users */}
                <Button
                  asChild
                  className="border-white bg-emerald-600 text-white hover:bg-white/10 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg"
                >
                  <Link href="/contact">Contact Our Team</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
