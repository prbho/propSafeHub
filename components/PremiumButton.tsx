'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PlanType } from '@/types'
import { Check, Clock, Crown, Loader2, Sparkles, Star, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { PREMIUM_PLANS } from '@/lib/services/premium-service'

interface PremiumButtonProps {
  propertyId: string
  propertyTitle: string
  currentPlan?: PlanType | null
  onUpgrade?: (planType: PlanType) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'urgent' | 'featured'
}

export default function PremiumButton({
  propertyId,
  propertyTitle,
  currentPlan,
  onUpgrade,
  size = 'md',
  variant = 'default',
}: PremiumButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [pulse, setPulse] = useState(false)
  const { user } = useAuth()

  // Add occasional pulse animation for attention
  useEffect(() => {
    if (variant === 'urgent' && !currentPlan) {
      const interval = setInterval(() => {
        setPulse(true)
        setTimeout(() => setPulse(false), 1000)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [variant, currentPlan])

  const handleUpgrade = async (planType: PlanType) => {
    if (!user) {
      toast.error('Please sign in to upgrade your listing')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          planType,
          propertyId,
          agentId: user.$id,
          userId: user.$id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to initialize payment')
      }

      const { authorizationUrl } = await response.json()
      window.location.href = authorizationUrl
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to upgrade listing'
      )
    } finally {
      setIsProcessing(false)
      setIsOpen(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price / 100)
  }

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  // Variant styles
  const variantStyles = {
    default: currentPlan
      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white shadow-lg'
      : 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-white shadow-lg hover:from-amber-600 hover:via-amber-600 hover:to-amber-700',
    urgent: currentPlan
      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white shadow-lg'
      : 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:via-red-600 hover:to-orange-700 animate-pulse',
    featured: currentPlan
      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white shadow-lg'
      : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500 text-white shadow-lg hover:from-yellow-500 hover:via-orange-600 hover:to-yellow-600',
  }

  return (
    <>
      {/* Enhanced Premium Button */}
      <div className="relative">
        {/* Floating sparkles effect */}
        {!currentPlan && variant === 'urgent' && (
          <div className="absolute -top-2 -right-2">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-5 h-5 text-yellow-400 opacity-75" />
              </div>
            </div>
          </div>
        )}

        {/* Badge for urgency */}
        {!currentPlan && variant === 'urgent' && (
          <div className="absolute -top-3 -left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
            HOT!
          </div>
        )}

        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isProcessing}
          className={`
            relative flex items-center gap-2 rounded-lg font-bold transition-all duration-300
            ${sizeClasses[size]}
            ${variantStyles[variant]}
            ${pulse && !currentPlan ? 'animate-pulse scale-105' : ''}
            ${isHovered && !currentPlan ? 'scale-105 shadow-xl' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
            group overflow-hidden
          `}
        >
          {/* Animated background shine */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : currentPlan ? (
            <>
              <Crown className="w-4 h-4" />
              <span>Premium Active</span>
            </>
          ) : (
            <>
              <span className="relative">
                {variant === 'urgent' ? '🔥 BOOST NOW!' : '🚀 GO PREMIUM'}
              </span>
              {variant === 'featured' && (
                <Sparkles className="w-4 h-4 animate-pulse" />
              )}
            </>
          )}
        </button>
      </div>

      {/* Enhanced Premium Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
            {/* Enhanced Header */}
            <div className="sticky top-0 bg-linear-to-r from-emerald-600 to-emerald-700 text-white p-8 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500 rounded-xl backdrop-blur-sm">
                    <Crown className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl text-center font-bold">
                    Supercharge Your Listing!
                  </h2>
                  <p className="text-emerald-100 mt-2">
                    Make <strong>&quot;{propertyTitle}&quot;</strong> stand out
                    and get
                    <strong>10x more views</strong>
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-3 hover:bg-white/20 rounded-xl transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Enhanced Plans */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {Object.entries(PREMIUM_PLANS).map(([planKey, plan]) => {
                  const planType = planKey as PlanType
                  const isCurrentPlan = currentPlan === planType
                  const isPopular = planType === 'premium'

                  return (
                    <div
                      key={planKey}
                      className={`
                        relative border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer
                        ${
                          selectedPlan === planType
                            ? 'border-emerald-500 bg-emerald-50 shadow-2xl scale-105 ring-4 ring-emerald-200'
                            : isCurrentPlan
                              ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                              : isPopular
                                ? 'border-orange-500 bg-linear-to-b from-orange-50 to-white shadow-xl'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        }
                        group
                      `}
                      onClick={() =>
                        !isCurrentPlan && setSelectedPlan(planType)
                      }
                    >
                      {/* Popular Badge */}
                      {isPopular && !isCurrentPlan && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                          ⭐ MOST POPULAR
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                          <div
                            className={`
                            p-3 rounded-xl
                            ${planType === 'featured' ? 'bg-yellow-100 text-yellow-600' : ''}
                            ${planType === 'premium' ? 'bg-orange-100 text-orange-600' : ''}
                            ${planType === 'enterprise' ? 'bg-purple-100 text-purple-600' : ''}
                          `}
                          >
                            {planType === 'featured' && (
                              <Zap className="w-8 h-8" />
                            )}
                            {planType === 'premium' && (
                              <Star className="w-8 h-8" />
                            )}
                            {planType === 'enterprise' && (
                              <Crown className="w-8 h-8" />
                            )}
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {plan.name}
                        </h3>

                        <div className="mb-4">
                          <span className="text-4xl font-bold text-gray-900">
                            {formatPrice(plan.price)}
                          </span>
                          <span className="text-gray-600 ml-2 text-lg">
                            /{plan.duration} days
                          </span>
                        </div>

                        {!isCurrentPlan && (
                          <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" />
                            Only ₦
                            {Math.round(
                              plan.price / 100 / plan.duration
                            ).toLocaleString()}{' '}
                            per day
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-4 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Action Button */}
                      {isCurrentPlan ? (
                        <div className="text-center p-4 bg-green-100 border border-green-200 rounded-xl">
                          <div className="flex items-center justify-center gap-2 text-green-800 font-semibold">
                            <Check className="w-5 h-5" />
                            Currently Active
                          </div>
                          <p className="text-green-600 text-sm mt-1">
                            Expires in {plan.duration} days
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpgrade(planType)
                          }}
                          disabled={isProcessing}
                          className={`
                            w-full py-4 px-6 rounded-xl font-bold transition-all duration-300
                            ${
                              selectedPlan === planType || isPopular
                                ? 'bg-linear-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                            group
                          `}
                        >
                          {isProcessing ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              {isPopular ? '🔥 GET PREMIUM' : 'Select Plan'}
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Enhanced Selected Plan Action */}
              {selectedPlan && !currentPlan && (
                <div className="mt-8 p-8 bg-linear-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <Sparkles className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-emerald-900">
                          Ready to skyrocket your listing? 🚀
                        </h3>
                        <p className="text-emerald-800 mt-1">
                          You selected:{' '}
                          <strong>{PREMIUM_PLANS[selectedPlan].name}</strong> -
                          Get ready for more views, leads, and faster sales!
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpgrade(selectedPlan)}
                      disabled={isProcessing}
                      className="bg-linear-to-r from-emerald-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 flex items-center gap-3 font-bold text-lg"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Crown className="w-6 h-6" />
                          <div className="text-left">
                            <div>UPGRADE NOW</div>
                            <div className="text-sm font-normal opacity-90">
                              {formatPrice(PREMIUM_PLANS[selectedPlan].price)}
                            </div>
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
