'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle,
  Download,
  File,
  FileText,
  Shield,
} from 'lucide-react'

// Define guide types
interface Guide {
  id: string
  title: string
  filename: string
  description: string
  size: string
  icon: string
  features: string[]
}

// Available guides
const guides: Record<string, Guide> = {
  'land-checks': {
    id: 'land-checks',
    title: '10 Checks to Do Before You Send Money for Land in Nigeria',
    filename: '10-checks-before-sending-money-for-land-in-nigeria.pdf',
    description: 'Essential verification steps before any land purchase',
    size: '2.8 MB',
    icon: '🏠',
    features: [
      '10 critical verification steps for land purchases',
      'How to verify land titles and ownership',
      'Red flags to watch out for in land deals',
      'Legal documents you must request',
      'Government agency verification checklist',
      'Avoid common land scam tactics',
    ],
  },
  'property-guide': {
    id: 'property-guide',
    title: 'Complete Property Safety Guide for Nigerian Real Estate',
    filename: 'property-safety-guide-nigeria.pdf',
    description: 'Comprehensive guide for safe property buying',
    size: '3.2 MB',
    icon: '🏢',
    features: [
      'Complete property buying checklist',
      'How to verify property documents',
      'Working with trusted agents',
      'Legal process explained',
      'Financing and payment protection',
      'Post-purchase property management',
    ],
  },
  'scam-prevention': {
    id: 'scam-prevention',
    title: 'Property Scam Prevention Guide',
    filename: 'property-scam-prevention-guide.pdf',
    description: 'Identify and avoid real estate scams',
    size: '2.1 MB',
    icon: '🛡️',
    features: [
      'Common scam techniques exposed',
      'How scammers operate in Nigeria',
      'Red flags checklist',
      'Verification protocols',
      "What to do if you've been scammed",
      'Legal recourse options',
    ],
  },
}

export default function DownloadPage() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || 'there'
  const guideId = searchParams.get('guide') || 'land-checks'

  const [downloadStarted, setDownloadStarted] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [guide, setGuide] = useState<Guide>(
    guides[guideId] || guides['land-checks']
  )

  // Update guide if ID changes
  useEffect(() => {
    if (guides[guideId]) {
      setGuide(guides[guideId])
    }
  }, [guideId])

  // Auto-start download after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDownload()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Countdown effect
  useEffect(() => {
    if (countdown > 0 && !downloadStarted) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, downloadStarted])

  const handleDownload = () => {
    setDownloadStarted(true)

    // Dynamic PDF URL based on guide
    const pdfUrl = `/guides/${guide.filename}`

    // Create a temporary anchor element
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = guide.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Track download for analytics (optional)
  useEffect(() => {
    if (downloadStarted) {
      // Send analytics event
      fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId: guide.id,
          guideTitle: guide.title,
          userName: name,
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error)
    }
  }, [downloadStarted, guide.id, guide.title, name])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-[#0D2A52] text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">Property Safety Hub</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Thanks {name}! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your guide is ready to download
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="md:flex">
            {/* Left Column - Guide Preview */}
            <div className="md:w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center border-r border-gray-200">
              <div className="w-48 h-64 bg-gradient-to-br from-[#0D2A52] to-[#1a3d6e] rounded-lg shadow-lg flex flex-col items-center justify-center text-white mb-4">
                <div className="text-5xl mb-2">{guide.icon}</div>
                <FileText className="w-12 h-12 mb-2" />
                <p className="text-sm font-semibold text-center px-2">
                  {guide.title.substring(0, 40)}...
                </p>
                <p className="text-xs opacity-75 mt-2">PDF • {guide.size}</p>
              </div>

              {!downloadStarted ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Download starting in {countdown} seconds...
                  </p>
                  <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
                    <div
                      className="h-full bg-[#0D2A52] transition-all duration-1000"
                      style={{ width: `${(3 - countdown) * 33.33}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Download started!
                </p>
              )}
            </div>

            {/* Right Column - Download Button & Info */}
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {guide.title}
              </h2>
              <p className="text-gray-600 mb-4">{guide.description}</p>

              <h3 className="font-semibold text-gray-900 mb-3">
                What's Inside:
              </h3>
              <ul className="space-y-2 mb-6">
                {guide.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleDownload}
                disabled={downloadStarted}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  downloadStarted
                    ? 'bg-green-600 cursor-default'
                    : 'bg-[#0D2A52] hover:bg-[#061c3a] transform hover:scale-[1.02]'
                }`}
              >
                {downloadStarted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Download Started
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Your Free Guide Now
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Secure PDF • No spam • Instant access
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Guides Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            You Might Also Like
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(guides).map(([id, altGuide]) => {
              if (id === guideId) return null
              return (
                <Link
                  key={id}
                  href={`/download?name=${encodeURIComponent(name)}&guide=${id}`}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  <div className="text-3xl">{altGuide.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#0D2A52] transition-colors">
                      {altGuide.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {altGuide.size} • PDF
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#0D2A52] transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 font-bold text-xl">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Download Guide</h3>
            <p className="text-sm text-gray-600">
              Save the PDF to your device for offline access
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 font-bold text-xl">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Read & Learn</h3>
            <p className="text-sm text-gray-600">
              Review the checklist and verification steps
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 font-bold text-xl">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Start Searching
            </h3>
            <p className="text-sm text-gray-600">
              Browse verified properties with confidence
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#0D2A52] to-[#1a3d6e] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">
            Ready to Find Your Safe Property?
          </h2>
          <p className="text-blue-100 mb-6">
            Browse our verified listings from trusted agents
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-white text-[#0D2A52] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Properties
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Didn't get email? */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Didn't receive the email?{' '}
            <button
              onClick={handleDownload}
              className="text-[#0D2A52] font-semibold hover:underline"
            >
              Click here to download again
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
