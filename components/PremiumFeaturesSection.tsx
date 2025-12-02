'use client'

import { Check, Crown, Eye, Star, Zap } from 'lucide-react'

import CountdownTimer from '@/components/CountdownTimer'
import PremiumButton from '@/components/PremiumButton'

interface PremiumFeaturesSectionProps {
  premiumStatus: {
    hasPremium: boolean
    activePlans: string[]
    startDate: string | null
    expiresAt: string | null
  }
  onExtendPlan?: () => void
}

export default function PremiumFeaturesSection({
  premiumStatus,
  onExtendPlan,
}: PremiumFeaturesSectionProps) {
  const handleExtendPlan = () => {
    if (onExtendPlan) {
      onExtendPlan()
    } else {
      // Default behavior - navigate to pricing page
      window.location.href = '/pricing'
    }
  }

  const features = [
    {
      id: 1,
      title: 'Enhanced Visibility',
      description: 'Your properties appear at the top of search results',
      icon: Eye,
      premiumColor: 'text-green-600',
      defaultColor: 'text-emerald-600',
    },
    {
      id: 2,
      title: 'Premium Badge',
      description: 'Stand out with exclusive premium verification badge',
      icon: Star,
      premiumColor: 'text-green-600',
      defaultColor: 'text-emerald-600',
    },
    {
      id: 3,
      title: 'Priority Support',
      description: 'Get faster responses and dedicated support',
      icon: Zap,
      premiumColor: 'text-green-600',
      defaultColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Premium Features
          </h2>
          <p className="text-gray-600 mt-1">
            Unlock exclusive features to boost your real estate experience
          </p>
        </div>

        {premiumStatus.hasPremium ? (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            Premium Active
          </div>
        ) : (
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Ready to upgrade?</p>
            <PremiumButton
              propertyId="profile-upgrade"
              propertyTitle="Profile Premium Upgrade"
              currentPlan={null}
            />
          </div>
        )}
      </div>

      {/* Premium Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`border rounded-lg p-4 ${
              premiumStatus.hasPremium
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${
                  premiumStatus.hasPremium ? 'bg-green-100' : 'bg-blue-100'
                }`}
              >
                <feature.icon
                  className={`w-5 h-5 ${
                    premiumStatus.hasPremium
                      ? feature.premiumColor
                      : feature.defaultColor
                  }`}
                />
              </div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
            {premiumStatus.hasPremium ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                <span>Active</span>
              </div>
            ) : (
              <span className="text-emerald-600 text-sm font-medium">
                Upgrade to unlock
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Current Plan Info */}
      {premiumStatus.hasPremium && premiumStatus.expiresAt && (
        <div className="mt-6">
          <div className="bg-linear-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Time Remaining
                </h4>
                <CountdownTimer
                  targetDate={premiumStatus.expiresAt}
                  showLabels={true}
                  className="justify-start"
                />
              </div>
              <button
                onClick={handleExtendPlan}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Extend Plan
              </button>
            </div>
          </div>

          {/* Additional plan info */}
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-600">Active Plans:</span>
                <span className="ml-2 font-semibold capitalize">
                  {premiumStatus.activePlans.join(', ') || 'Premium Membership'}
                </span>
              </div>
              <div className="ml-auto">
                <span className="text-gray-600">Expires:</span>
                <span className="ml-2 font-semibold">
                  {new Date(premiumStatus.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
