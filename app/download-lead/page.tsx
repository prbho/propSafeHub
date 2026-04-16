'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Download,
  Loader2,
} from 'lucide-react'

function DownloadContent() {
  const searchParams = useSearchParams()
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [isValidAccess, setIsValidAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Get parameters from URL
  const name = searchParams.get('name') || ''
  const email = searchParams.get('email') || ''
  const pdfPath =
    searchParams.get('pdfPath') ||
    '/doc/10-Checks-to-Do-Before-You-Send-Money-for-Land-in-Nigeria.pdf'
  const pdfTitle =
    searchParams.get('pdfTitle') ||
    '10 Checks to Do Before You Send Money for Land in Nigeria'

  useEffect(() => {
    // Check if user came from email link
    if (name || email) {
      setIsValidAccess(true)
    }
    setIsChecking(false)
  }, [name, email])

  // Auto-start download after 3 seconds if valid access
  useEffect(() => {
    if (isValidAccess && countdown > 0 && !downloadStarted) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isValidAccess && countdown === 0 && !downloadStarted) {
      handleDownload()
    }
  }, [countdown, isValidAccess, downloadStarted])

  const handleDownload = () => {
    if (!isValidAccess) return

    setDownloadStarted(true)

    // Use the pdfPath from URL parameters
    const link = document.createElement('a')
    link.href = pdfPath
    link.download = pdfPath.split('/').pop() || 'guide.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D2A52] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Invalid access
  if (!isValidAccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Access Restricted
          </h1>
          <p className="text-gray-600 mb-6">
            This page is only accessible through the download link sent to your
            email. Please check your inbox for the link.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#0D2A52] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#061c3a] transition-colors"
          >
            Return to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  // Valid access - show download page
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Thanks {name}! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your guide is ready to download
          </p>
        </div>

        {/* Download Card */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-300">
          {/* File Preview */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-32 h-40 bg-linear-to-br from-red-500 to-red-600 rounded-xl shadow-lg flex flex-col items-center justify-center text-white mb-4">
              <FileText className="w-12 h-12 mb-2" />
              <p className="text-xs font-semibold px-2">PDF Document</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">{pdfTitle}</h2>
            <p className="text-sm text-gray-500">
              PDF • {pdfPath.includes('Checks') ? '88.7' : '2.5'} KB
            </p>
          </div>

          {/* Download Progress */}
          {!downloadStarted ? (
            <div className="text-center">
              <p className="text-gray-600 mb-3">
                Download starting in {countdown} seconds...
              </p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0D2A52] transition-all duration-1000 rounded-full"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>
              <button
                onClick={handleDownload}
                className="mt-6 text-sm text-[#0D2A52] hover:underline"
              >
                Download now
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Download Started!</span>
              </div>
              <p className="text-sm text-emerald-600">
                Check your downloads folder for the PDF file
              </p>
              <button
                onClick={handleDownload}
                className="mt-6 text-sm text-[#0D2A52] hover:underline flex items-center justify-center gap-1"
              >
                <Download className="w-4 h-4" />
                Download again
              </button>
            </div>
          )}
        </div>

        {/* Next Steps */}
        {/* <div className="text-center">
          <p className="text-sm text-gray-500">
            We've also sent this guide to your email for safekeeping.
          </p>
        </div> */}
      </div>
    </div>
  )
}

export default function DownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#0D2A52] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <DownloadContent />
    </Suspense>
  )
}

function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
