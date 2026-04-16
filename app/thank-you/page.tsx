'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCheckIcon, CheckIcon } from 'lucide-react'

export default function ThankYouPage() {
  const params = useSearchParams()

  const name = params.get('name') || 'there'
  const intent = params.get('intent') || ''
  const country = params.get('country') || ''

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

  const ENABLE_AUTO_REDIRECT = true // 👈 toggle this
  const COUNTDOWN_SECONDS = 10

  const message = `Hi, I just downloaded the property guide. I'm ${name} from ${country}. I'm interested in ${intent}.`

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message
  )}`

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    if (!ENABLE_AUTO_REDIRECT) return

    if (countdown <= 0) {
      window.location.href = whatsappLink
      return
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, ENABLE_AUTO_REDIRECT, whatsappLink])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-xl w-full">
        <div className="bg-white border border-neutral-300 rounded-2xl p-8 text-center space-y-4">
          <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
            <CheckIcon className="text-emerald-700 h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-stone-800">
            You're All Set, {name}
          </h1>

          <p className="text-gray-600 text-sm">
            Your property safety guide has been sent to your email.
          </p>

          <div className="bg-slate-50 rounded-xl p-5 mt-4 border border-slate-200">
            <h2 className="font-semibold text-stone-800">
              Get Verified Property Options Faster
            </h2>

            <p className="text-sm text-gray-600 mt-2">
              Based on your interest, we can show you safe and verified
              listings.
            </p>

            <a
              href={whatsappLink}
              className="block mt-4 bg-[#0D2A52] hover:bg-[#061c3a] text-white py-3 rounded-lg font-semibold transition"
            >
              Chat on WhatsApp
            </a>
          </div>

          {ENABLE_AUTO_REDIRECT && (
            <>
              <p className="text-xs text-gray-500">
                Connecting you to a property advisor in…{' '}
                <span className="font-semibold text-stone-800">
                  {countdown}
                </span>{' '}
                seconds
              </p>

              <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#0D2A52] h-full transition-all duration-1000"
                  style={{
                    width: `${(countdown / COUNTDOWN_SECONDS) * 100}%`,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
