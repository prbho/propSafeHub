// components/MortgageCalculator.tsx
import { useEffect, useState } from 'react'
import { Property } from '@/types'
import { MortgageCalculation, MortgageFormData } from '@/types/mortgage'
import { formatCurrency } from '@/utils/formatters'
import {
  ArrowLeft,
  BarChart3,
  Calculator,
  Clock,
  Download,
  Percent,
  Share2,
  TrendingUp,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

interface MortgageCalculatorProps {
  property: Property
  isOpen: boolean
  onClose: () => void
  userId?: string
}

type ViewMode = 'form' | 'results'

export default function MortgageCalculator({
  property,
  isOpen,
  onClose,
  userId,
}: MortgageCalculatorProps) {
  const [formData, setFormData] = useState<MortgageFormData>({
    propertyPrice: property?.price || 0,
    loanAmount: Math.round((property?.price || 0) * 0.8),
    downPayment: Math.round((property?.price || 0) * 0.2),
    interestRate: 25,
    loanTerm: 15,
  })

  const [result, setResult] = useState<MortgageCalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveToHistory, setSaveToHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('form')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showAmortization, setShowAmortization] = useState(false)

  useEffect(() => {
    if (property?.price) {
      const downPayment = Math.round(property.price * 0.2)
      setFormData({
        propertyPrice: property.price,
        downPayment,
        loanAmount: property.price - downPayment,
        interestRate: 25,
        loanTerm: 15,
      })
    }
  }, [property])

  const calculateMortgage = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/calculator/mortgage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property?.$id,
          ...formData,
          userId,
          saveCalculation: saveToHistory && userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || `Calculation failed with status: ${response.status}`
        )
      }

      if (data.success) {
        setResult(data.calculation)

        if (saveToHistory && userId) {
          if (data.saved) {
            toast.success('Calculation saved to your history!')
          } else {
            toast.warning('Calculation completed but failed to save to history')
          }
        }

        setTimeout(() => {
          setViewMode('results')
        }, 300)
      } else {
        throw new Error(data.error || 'Calculation failed')
      }
    } catch (error) {
      console.error('Calculation error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Error calculating mortgage'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof MortgageFormData, value: number) => {
    const newData = { ...formData }

    if (field === 'downPayment') {
      newData.downPayment = value
      newData.loanAmount = Math.max(0, newData.propertyPrice - value)
    } else if (field === 'loanAmount') {
      newData.loanAmount = value
      newData.downPayment = Math.max(0, newData.propertyPrice - value)
    } else if (field === 'propertyPrice') {
      newData.propertyPrice = value
      const downPaymentPercent =
        (newData.downPayment / formData.propertyPrice) * 100
      newData.downPayment = Math.round(value * (downPaymentPercent / 100))
      newData.loanAmount = Math.max(0, value - newData.downPayment)
    } else {
      newData[field] = value
    }

    setFormData(newData)
  }

  const handleDownPaymentPercentChange = (percent: number) => {
    const downPayment = Math.round(formData.propertyPrice * (percent / 100))
    setFormData((prev) => ({
      ...prev,
      downPayment,
      loanAmount: Math.max(0, prev.propertyPrice - downPayment),
    }))
  }

  const handleBackToForm = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setViewMode('form')
      setIsAnimating(false)
    }, 300)
  }

  const handleRecalculate = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setViewMode('form')
      setIsAnimating(false)
    }, 300)
  }

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setViewMode('form')
      setIsAnimating(false)
      onClose()
    }, 300)
  }

  const handleShare = () => {
    if (navigator.share && result) {
      navigator.share({
        title: `Mortgage Calculation for ${property?.title}`,
        text: `Monthly payment: ${formatCurrency(result.monthlyPayment)} | Total payment: ${formatCurrency(result.totalPayment)}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(
        `Mortgage Calculation: ${property?.title}\nMonthly Payment: ${formatCurrency(result?.monthlyPayment || 0)}\nTotal Payment: ${formatCurrency(result?.totalPayment || 0)}\nInterest Rate: ${formData.interestRate}%`
      )
      toast.success('Calculation copied to clipboard!')
    }
  }

  const handleExport = () => {
    if (!result) return

    const csvContent = [
      ['Category', 'Amount'],
      ['Property Price', formatCurrency(result.propertyPrice)],
      ['Down Payment', formatCurrency(result.downPayment)],
      ['Loan Amount', formatCurrency(result.loanAmount)],
      ['Interest Rate', `${result.interestRate}%`],
      ['Loan Term', `${result.loanTerm} years`],
      ['Monthly Payment', formatCurrency(result.monthlyPayment)],
      ['Total Payment', formatCurrency(result.totalPayment)],
      ['Total Interest', formatCurrency(result.totalInterest)],
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mortgage-calculation-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  const downPaymentPercent = Math.round(
    (formData.downPayment / formData.propertyPrice) * 100
  )

  const loanToValueRatio = Math.round(
    (formData.loanAmount / formData.propertyPrice) * 100
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="py-3 px-4 border-b bg-linear-to-r from-emerald-50 via-green-50 to-teal-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {viewMode === 'results' && (
                <button
                  onClick={handleBackToForm}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="flex items-center space-x-2">
                {viewMode === 'form' ? (
                  <Calculator size={22} className="text-emerald-600" />
                ) : (
                  <BarChart3 size={22} className="text-emerald-600" />
                )}
                <h2 className="text-lg font-bold text-gray-900">
                  {viewMode === 'form'
                    ? 'Mortgage Calculator'
                    : 'Calculation Results'}
                </h2>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Property Info */}
          <div className="mb-6 p-4 bg-linear-to-r from-emerald-50/50 to-green-50/50 rounded-xl border border-emerald-100">
            <h3 className="font-semibold text-gray-900 truncate">
              {property?.title}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(property?.price)}
              </p>
              <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border">
                {property?.propertyType || 'Property'}
              </span>
            </div>
          </div>

          {/* Form View */}
          <div
            className={`transition-all duration-300 ${
              viewMode === 'form'
                ? 'block opacity-100 max-h-[1000px]'
                : 'hidden opacity-0 max-h-0'
            }`}
          >
            {/* Quick Stats Bar */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Percent size={14} />
                  <span>Down Payment</span>
                </div>
                <div className="mt-1 text-lg font-bold text-gray-900">
                  {downPaymentPercent}%
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <TrendingUp size={14} />
                  <span>LTV Ratio</span>
                </div>
                <div className="mt-1 text-lg font-bold text-gray-900">
                  {loanToValueRatio}%
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Calculator Form */}
            <div className="space-y-6">
              {/* Property Price */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-900">
                    Property Price
                  </label>
                  <span className="text-xs text-gray-500">₦</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ₦
                  </div>
                  <input
                    type="number"
                    value={formData.propertyPrice}
                    onChange={(e) =>
                      handleInputChange('propertyPrice', Number(e.target.value))
                    }
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-400"
                    min="0"
                    step="10000"
                  />
                </div>
              </div>

              {/* Down Payment */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-900">
                    Down Payment
                  </label>
                  <span className="text-sm font-semibold text-emerald-700">
                    {downPaymentPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) =>
                    handleDownPaymentPercentChange(Number(e.target.value))
                  }
                  className="w-full h-2 bg-linear-to-r from-gray-200 to-emerald-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  {[10, 20, 30, 40, 50].map((percent) => (
                    <span
                      key={percent}
                      className={`cursor-pointer px-2 py-1 rounded ${
                        downPaymentPercent === percent
                          ? 'bg-emerald-100 text-emerald-700 font-semibold'
                          : 'hover:text-gray-700'
                      }`}
                      onClick={() => handleDownPaymentPercentChange(percent)}
                    >
                      {percent}%
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ₦
                  </div>
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) =>
                      handleInputChange('downPayment', Number(e.target.value))
                    }
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-400"
                    min="0"
                    max={formData.propertyPrice}
                    step="10000"
                  />
                </div>
              </div>

              {/* Loan Amount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-900">
                    Loan Amount
                  </label>
                  <span className="text-sm font-semibold text-blue-700">
                    {loanToValueRatio}% LTV
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ₦
                  </div>
                  <input
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) =>
                      handleInputChange('loanAmount', Number(e.target.value))
                    }
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-400"
                    min="0"
                    max={formData.propertyPrice}
                    step="10000"
                  />
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-900">
                    Interest Rate
                  </label>
                  <span className="text-sm font-semibold text-orange-700">
                    {formData.interestRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="17"
                  max="30"
                  step="0.5"
                  value={formData.interestRate}
                  onChange={(e) =>
                    handleInputChange('interestRate', Number(e.target.value))
                  }
                  className="w-full h-2 bg-linear-to-r from-gray-200 to-orange-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  {['17%', '20%', '25%', '30%'].map((rate, idx) => (
                    <span
                      key={idx}
                      className="cursor-pointer px-2 py-1 rounded hover:text-gray-700"
                      onClick={() =>
                        handleInputChange('interestRate', parseFloat(rate))
                      }
                    >
                      {rate}
                    </span>
                  ))}
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-900">
                    Loan Term
                  </label>
                  <span className="flex items-center gap-1 text-sm font-semibold text-purple-700">
                    <Clock size={14} />
                    {formData.loanTerm} years
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={formData.loanTerm}
                  onChange={(e) =>
                    handleInputChange('loanTerm', Number(e.target.value))
                  }
                  className="w-full h-2 bg-linear-to-r from-gray-200 to-purple-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="grid grid-cols-4 gap-1">
                  {[5, 10, 15, 20].map((years) => (
                    <button
                      key={years}
                      onClick={() => handleInputChange('loanTerm', years)}
                      className={`py-2 text-xs font-medium rounded-lg transition-all ${
                        formData.loanTerm === years
                          ? 'bg-purple-100 text-purple-700 border border-purple-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {years} yrs
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Option */}
              {userId && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={saveToHistory}
                        onChange={(e) => setSaveToHistory(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-md peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-all duration-200 flex items-center justify-center">
                        {saveToHistory && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">
                      Save this calculation to my history
                    </span>
                  </label>
                </div>
              )}

              {/* Calculate Button */}
              <button
                onClick={calculateMortgage}
                disabled={loading || formData.loanAmount <= 0}
                className="w-full bg-linear-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-3 rounded-xl hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <Calculator size={18} />
                    <span>Calculate Mortgage</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results View */}
          <div
            className={`transition-all duration-300 ${
              viewMode === 'results'
                ? 'block opacity-100 max-h-[1000px]'
                : 'hidden opacity-0 max-h-0'
            }`}
          >
            {result && (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-300 hover:shadow-md"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-300 hover:shadow-md"
                  >
                    <Download size={16} />
                    Export
                  </button>
                </div>

                {/* Main Results Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-linear-to-br from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Monthly Payment
                    </p>
                    <p className="text-xl font-bold text-emerald-700">
                      {formatCurrency(result.monthlyPayment)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per month</p>
                  </div>

                  <div className="text-center p-4 bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Total Payment
                    </p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(result.totalPayment)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      over {result.loanTerm} years
                    </p>
                  </div>

                  <div className="text-center p-4 bg-linear-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Total Interest
                    </p>
                    <p className="text-xl font-bold text-orange-700">
                      {formatCurrency(result.totalInterest)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">interest paid</p>
                  </div>

                  <div className="text-center p-4 bg-linear-to-br from-purple-500/10 to-violet-500/10 rounded-xl border border-purple-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Loan Term
                    </p>
                    <p className="text-xl font-bold text-purple-700">
                      {result.loanTerm} years
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({result.loanTerm * 12} months)
                    </p>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-linear-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 size={18} className="text-emerald-600" />
                    Loan Summary
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        label: 'Property Price',
                        value: formatCurrency(result.propertyPrice),
                        color: 'text-gray-900',
                      },
                      {
                        label: 'Down Payment',
                        value: `${formatCurrency(result.downPayment)} (${result.downPaymentPercent?.toFixed(1)}%)`,
                        color: 'text-emerald-700',
                      },
                      {
                        label: 'Loan Amount',
                        value: formatCurrency(result.loanAmount),
                        color: 'text-blue-700',
                      },
                      {
                        label: 'Interest Rate',
                        value: `${result.interestRate}% APR`,
                        color: 'text-orange-700',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-1.5"
                      >
                        <span className="text-sm text-gray-600">
                          {item.label}:
                        </span>
                        <span className={`font-semibold ${item.color}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-900">
                          Total Cost:
                        </span>
                        <span className="font-bold text-lg text-gray-900">
                          {formatCurrency(result.totalPayment)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interest Visualization */}
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 text-sm">
                    Payment Composition
                  </h5>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(result.loanAmount / result.totalPayment) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>
                        Principal: {formatCurrency(result.loanAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>
                        Interest: {formatCurrency(result.totalInterest)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleRecalculate}
                    className="flex-1 bg-white text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-300 hover:shadow-md"
                  >
                    Adjust Values
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-linear-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Done
                  </button>
                </div>

                {/* Save Notice */}
                {saveToHistory && userId && (
                  <div className="p-3 bg-linear-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-700 text-center flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Calculation saved to your history
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
