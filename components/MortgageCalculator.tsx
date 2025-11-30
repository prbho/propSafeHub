// components/MortgageCalculator.tsx
import { useEffect, useState } from 'react'
import { Property } from '@/types'
import { MortgageCalculation, MortgageFormData } from '@/types/mortgage'
import { formatCurrency } from '@/utils/formatters'
import { ArrowLeft, BarChart3, Calculator, X } from 'lucide-react'
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

        // Show save status to user
        if (saveToHistory && userId) {
          if (data.saved) {
            toast.success('Calculation saved to your history!')
          } else {
            toast.warning('Calculation completed but failed to save to history')
          }
        }

        // Animate to results view
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
      // Adjust down payment and loan amount proportionally
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

  if (!isOpen) return null

  const downPaymentPercent = Math.round(
    (formData.downPayment / formData.propertyPrice) * 100
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="py-2 px-4 border-b bg-linear-to-r from-emerald-50 to-green-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {viewMode === 'results' && (
                <button
                  onClick={handleBackToForm}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="flex items-center space-x-2">
                {viewMode === 'form' ? (
                  <Calculator size={20} className="text-emerald-600" />
                ) : (
                  <BarChart3 size={20} className="text-emerald-600" />
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
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Property Info - Show in both views */}
          <div className="mb-6 px-4 rounded-lg">
            <h3 className="font-semibold text-black/80">{property?.title}</h3>
            <p className="text-xl font-bold text-emerald-700">
              {formatCurrency(property?.price)}
            </p>
          </div>

          {/* Form View */}
          <div
            className={`transition-all duration-300 ${
              viewMode === 'form'
                ? 'block opacity-100 max-h-[1000px]'
                : 'hidden opacity-0 max-h-0'
            }`}
          >
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Calculator Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Property Price (₦)
                </label>
                <input
                  type="number"
                  value={formData.propertyPrice}
                  onChange={(e) =>
                    handleInputChange('propertyPrice', Number(e.target.value))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Down Payment ({downPaymentPercent}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={downPaymentPercent}
                  onChange={(e) =>
                    handleDownPaymentPercentChange(Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>10%</span>
                  <span>50%</span>
                </div>
                <input
                  type="number"
                  value={formData.downPayment}
                  onChange={(e) =>
                    handleInputChange('downPayment', Number(e.target.value))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  min="0"
                  max={formData.propertyPrice}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Loan Amount (₦)
                </label>
                <input
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) =>
                    handleInputChange('loanAmount', Number(e.target.value))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  min="0"
                  max={formData.propertyPrice}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Interest Rate: {formData.interestRate}%
                </label>
                <input
                  type="range"
                  min="17"
                  max="30"
                  step="0.5"
                  value={formData.interestRate}
                  onChange={(e) =>
                    handleInputChange('interestRate', Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>17%</span>
                  <span>30%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Loan Term: {formData.loanTerm} years
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={formData.loanTerm}
                  onChange={(e) =>
                    handleInputChange('loanTerm', Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>5 years</span>
                  <span>20 years</span>
                </div>
              </div>

              {userId && (
                <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={saveToHistory}
                    onChange={(e) => setSaveToHistory(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    Save this calculation to my history
                  </span>
                </label>
              )}

              <button
                onClick={calculateMortgage}
                disabled={loading}
                className="w-full bg-linear-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Calculating...</span>
                  </div>
                ) : (
                  'Calculate Mortgage'
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
              <div className="space-y-4">
                {/* Main Results Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-4 bg-linear-to-br from-emerald-50 to-green-50 rounded-xl border-emerald-200 ">
                    <p className="text-sm text-gray-600">Monthly Payment</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(result.monthlyPayment)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per month</p>
                  </div>

                  <div className="text-center p-4 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl">
                    <p className="text-sm text-gray-600">Total Payment</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(result.totalPayment)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      over {result.loanTerm} years
                    </p>
                  </div>

                  <div className="text-center p-4 bg-linear-to-br from-orange-50 to-amber-50 rounded-xl">
                    <p className="text-sm text-gray-600">Total Interest</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(result.totalInterest)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">interest paid</p>
                  </div>

                  <div className="text-center p-4 bg-linear-to-br from-purple-50 to-violet-50 rounded-xl">
                    <p className="text-sm text-gray-600">Loan Term</p>
                    <p className="text-lg font-bold text-black">
                      {result.loanTerm} years
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({result.loanTerm * 12} months)
                    </p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Loan Breakdown
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Property Price:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(result.propertyPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Down Payment:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(result.downPayment)} (
                        {result.downPaymentPercent?.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Loan Amount:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(result.loanAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Interest Rate:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {result.interestRate}%
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Total Cost:
                        </span>
                        <span className="font-bold text-lg">
                          {formatCurrency(result.totalPayment)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleRecalculate}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 hover:shadow-md"
                  >
                    Recalculate
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-linear-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Done
                  </button>
                </div>

                {/* Save Notice */}
                {saveToHistory && userId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 text-center">
                      ✓ Calculation saved to your history
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
