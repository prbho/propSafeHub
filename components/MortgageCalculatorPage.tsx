// components/MortgageCalculatorPage.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/utils/formatters'
import {
  BarChart3,
  Calculator,
  Calendar,
  Clock,
  Download,
  Info,
  Percent,
  Share2,
  TrendingUp,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

// Types
interface MortgageFormData {
  propertyPrice: number
  loanAmount: number
  downPayment: number
  interestRate: number
  loanTerm: number
}

interface MortgageCalculation {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  loanTerm: number
  propertyPrice: number
  downPayment: number
  loanAmount: number
  interestRate: number
  downPaymentPercent?: number
}

interface AmortizationEntry {
  year: number
  month: number
  payment: number
  principal: number
  interest: number
  remainingBalance: number
  principalPercent: number
  interestPercent: number
}

export default function MortgageCalculatorPage() {
  const router = useRouter()

  // Default values matching your original component
  const defaultPropertyPrice = 50000000 // 50 million Naira as default

  const [formData, setFormData] = useState<MortgageFormData>({
    propertyPrice: defaultPropertyPrice,
    loanAmount: Math.round(defaultPropertyPrice * 0.8),
    downPayment: Math.round(defaultPropertyPrice * 0.2),
    interestRate: 25,
    loanTerm: 15,
  })

  const [result, setResult] = useState<MortgageCalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationEntry[]
  >([])
  const [showAmortization, setShowAmortization] = useState(false)
  const [showTips, setShowTips] = useState(true)
  const [saveToHistory, setSaveToHistory] = useState(false)
  const [calculationName, setCalculationName] = useState('')
  const [viewMode, setViewMode] = useState<
    'calculator' | 'results' | 'amortization'
  >('calculator')

  // Standard mortgage calculation formula
  const calculateMortgagePayment = useCallback(
    (
      loanAmount: number,
      annualInterestRate: number,
      loanTermYears: number
    ): number => {
      if (loanAmount <= 0) return 0

      const monthlyInterestRate = annualInterestRate / 100 / 12
      const numberOfPayments = loanTermYears * 12

      if (monthlyInterestRate === 0) {
        return loanAmount / numberOfPayments
      }

      const numerator =
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, numberOfPayments)
      const denominator =
        Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1

      return loanAmount * (numerator / denominator)
    },
    []
  )

  // Calculate complete mortgage details
  const calculateMortgage = useCallback(() => {
    setLoading(true)

    setTimeout(() => {
      try {
        const monthlyPayment = calculateMortgagePayment(
          formData.loanAmount,
          formData.interestRate,
          formData.loanTerm
        )

        const totalPayment = monthlyPayment * formData.loanTerm * 12
        const totalInterest = totalPayment - formData.loanAmount
        const downPaymentPercent =
          (formData.downPayment / formData.propertyPrice) * 100

        const calculation: MortgageCalculation = {
          monthlyPayment,
          totalPayment,
          totalInterest,
          loanTerm: formData.loanTerm,
          propertyPrice: formData.propertyPrice,
          downPayment: formData.downPayment,
          loanAmount: formData.loanAmount,
          interestRate: formData.interestRate,
          downPaymentPercent,
        }

        setResult(calculation)

        // Generate amortization schedule (first 5 years for performance)
        const schedule: AmortizationEntry[] = []
        const monthlyRate = formData.interestRate / 100 / 12
        const totalMonths = formData.loanTerm * 12
        let remainingBalance = formData.loanAmount

        // Show first 5 years or entire term if less than 5 years
        const displayYears = Math.min(5, formData.loanTerm)
        const displayMonths = displayYears * 12

        for (let month = 1; month <= displayMonths; month++) {
          const interestPayment = remainingBalance * monthlyRate
          const principalPayment = monthlyPayment - interestPayment
          remainingBalance = Math.max(0, remainingBalance - principalPayment)

          schedule.push({
            year: Math.ceil(month / 12),
            month: month,
            payment: monthlyPayment,
            principal: principalPayment,
            interest: interestPayment,
            remainingBalance: remainingBalance,
            principalPercent: (principalPayment / monthlyPayment) * 100,
            interestPercent: (interestPayment / monthlyPayment) * 100,
          })
        }

        setAmortizationSchedule(schedule)
        toast.success('Mortgage calculation completed!')
      } catch (error) {
        console.error('Calculation error:', error)
        toast.error('Error calculating mortgage. Please check your inputs.')
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [formData, calculateMortgagePayment])

  // Auto-calculate when form data changes
  useEffect(() => {
    calculateMortgage()
  }, [calculateMortgage])

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
      // Maintain the same down payment percentage
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

  const handleQuickPropertySelect = (price: number) => {
    setFormData({
      propertyPrice: price,
      downPayment: Math.round(price * 0.2),
      loanAmount: Math.round(price * 0.8),
      interestRate: 25,
      loanTerm: 15,
    })
  }

  const handleShare = () => {
    if (!result) return

    const shareText = `Mortgage Calculation Results:
🏠 Property Price: ${formatCurrency(result.propertyPrice)}
💰 Down Payment: ${formatCurrency(result.downPayment)} (${result.downPaymentPercent?.toFixed(1)}%)
📈 Loan Amount: ${formatCurrency(result.loanAmount)}
🎯 Interest Rate: ${result.interestRate}%
⏱️ Loan Term: ${result.loanTerm} years
📅 Monthly Payment: ${formatCurrency(result.monthlyPayment)}
💰 Total Payment: ${formatCurrency(result.totalPayment)}
💸 Total Interest: ${formatCurrency(result.totalInterest)}`

    if (navigator.share) {
      navigator
        .share({
          title: 'Mortgage Calculation Results',
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {
          navigator.clipboard.writeText(shareText)
          toast.success('Results copied to clipboard!')
        })
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success('Results copied to clipboard!')
    }
  }

  const handleExport = () => {
    if (!result) return

    const csvContent = [
      ['Mortgage Calculation Results'],
      [''],
      ['Category', 'Amount'],
      ['Property Price', formatCurrency(result.propertyPrice)],
      ['Down Payment', formatCurrency(result.downPayment)],
      ['Down Payment Percentage', `${result.downPaymentPercent?.toFixed(2)}%`],
      ['Loan Amount', formatCurrency(result.loanAmount)],
      [
        'Loan-to-Value Ratio',
        `${((result.loanAmount / result.propertyPrice) * 100).toFixed(2)}%`,
      ],
      ['Interest Rate', `${result.interestRate}% APR`],
      [
        'Loan Term',
        `${result.loanTerm} years (${result.loanTerm * 12} months)`,
      ],
      ['Monthly Payment', formatCurrency(result.monthlyPayment)],
      ['Total Payment', formatCurrency(result.totalPayment)],
      ['Total Interest', formatCurrency(result.totalInterest)],
      [
        'Interest-to-Principal Ratio',
        `${((result.totalInterest / result.loanAmount) * 100).toFixed(2)}%`,
      ],
      [''],
      ['Date', new Date().toLocaleDateString()],
      ['Time', new Date().toLocaleTimeString()],
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mortgage-calculation-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Calculation exported as CSV!')
  }

  const handleSaveCalculation = () => {
    if (!result) return

    const savedCalculations = JSON.parse(
      localStorage.getItem('mortgageCalculations') || '[]'
    )
    const newCalculation = {
      id: Date.now(),
      name: calculationName || `Calculation ${new Date().toLocaleDateString()}`,
      ...result,
      formData: { ...formData },
      date: new Date().toISOString(),
    }

    savedCalculations.unshift(newCalculation)
    localStorage.setItem(
      'mortgageCalculations',
      JSON.stringify(savedCalculations.slice(0, 10))
    ) // Keep last 10

    toast.success('Calculation saved!')
    setCalculationName('')
  }

  const resetCalculator = () => {
    setFormData({
      propertyPrice: defaultPropertyPrice,
      loanAmount: Math.round(defaultPropertyPrice * 0.8),
      downPayment: Math.round(defaultPropertyPrice * 0.2),
      interestRate: 25,
      loanTerm: 15,
    })
    setViewMode('calculator')
  }

  const downPaymentPercent = Math.round(
    (formData.downPayment / formData.propertyPrice) * 100
  )
  const loanToValueRatio = Math.round(
    (formData.loanAmount / formData.propertyPrice) * 100
  )

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calculator className="h-7 w-7 text-emerald-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Mortgage Calculator
                  </h1>
                  <p className="text-xs text-gray-500">
                    Calculate your home loan payments
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
              <button
                onClick={resetCalculator}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Calculator Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calculator Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-emerald-50 to-green-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Calculator
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Adjust the sliders and inputs to calculate your mortgage
                  payment
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Property Price */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-gray-900">
                      Property Price
                    </label>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Required
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      ₦
                    </div>
                    <input
                      type="number"
                      value={formData.propertyPrice}
                      onChange={(e) =>
                        handleInputChange(
                          'propertyPrice',
                          Number(e.target.value)
                        )
                      }
                      className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-400"
                      min="0"
                      step="100000"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[10000000, 25000000, 50000000, 100000000, 200000000].map(
                      (price) => (
                        <button
                          key={price}
                          onClick={() =>
                            handleInputChange('propertyPrice', price)
                          }
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                            formData.propertyPrice === price
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {formatCurrency(price)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Down Payment & Loan Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Down Payment */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-semibold text-gray-900">
                        Down Payment
                      </label>
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                        {downPaymentPercent}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="10"
                        max="50"
                        step="5"
                        value={downPaymentPercent}
                        onChange={(e) =>
                          handleDownPaymentPercentChange(Number(e.target.value))
                        }
                        className="w-full h-2 bg-linear-to-r from-gray-200 to-emerald-200 rounded-full appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        {[10, 20, 30, 40, 50].map((percent) => (
                          <button
                            key={percent}
                            onClick={() =>
                              handleDownPaymentPercentChange(percent)
                            }
                            className={`px-2 py-1 rounded ${
                              downPaymentPercent === percent
                                ? 'bg-emerald-100 text-emerald-700 font-semibold'
                                : 'hover:text-gray-700'
                            }`}
                          >
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        ₦
                      </div>
                      <input
                        type="number"
                        value={formData.downPayment}
                        onChange={(e) =>
                          handleInputChange(
                            'downPayment',
                            Number(e.target.value)
                          )
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-400"
                        min="0"
                        max={formData.propertyPrice}
                        step="100000"
                      />
                    </div>
                  </div>

                  {/* Loan Amount */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-semibold text-gray-900">
                        Loan Amount
                      </label>
                      <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        {loanToValueRatio}% LTV
                      </span>
                    </div>
                    <div className="pt-5"></div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        ₦
                      </div>
                      <input
                        type="number"
                        value={formData.loanAmount}
                        onChange={(e) =>
                          handleInputChange(
                            'loanAmount',
                            Number(e.target.value)
                          )
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-400"
                        min="0"
                        max={formData.propertyPrice}
                        step="100000"
                      />
                    </div>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-gray-900">
                      Interest Rate
                    </label>
                    <span className="text-sm font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded">
                      {formData.interestRate}% APR
                    </span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="15"
                      max="30"
                      step="0.5"
                      value={formData.interestRate}
                      onChange={(e) =>
                        handleInputChange(
                          'interestRate',
                          Number(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-linear-to-r from-gray-200 to-orange-200 rounded-full appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      {['15%', '20%', '25%', '30%'].map((rate, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleInputChange('interestRate', parseFloat(rate))
                          }
                          className="px-2 py-1 rounded hover:text-gray-700"
                        >
                          {rate}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Loan Term */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-gray-900">
                      Loan Term
                    </label>
                    <span className="text-sm font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                      {formData.loanTerm} years
                    </span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={formData.loanTerm}
                      onChange={(e) =>
                        handleInputChange('loanTerm', Number(e.target.value))
                      }
                      className="w-full h-2 bg-linear-to-r from-gray-200 to-purple-200 rounded-full appearance-none cursor-pointer slider"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 20, 25, 30].map((years) => (
                        <button
                          key={years}
                          onClick={() => handleInputChange('loanTerm', years)}
                          className={`py-2 text-sm font-medium rounded-lg transition-all ${
                            formData.loanTerm === years
                              ? 'bg-purple-100 text-purple-700 border border-purple-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {years} yrs
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Option */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
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
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        Save this calculation
                      </span>
                      <p className="text-xs text-gray-500">
                        Save to your calculation history for future reference
                      </p>
                    </div>
                  </label>
                  {saveToHistory && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={calculationName}
                        onChange={(e) => setCalculationName(e.target.value)}
                        placeholder="Enter a name for this calculation (optional)"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amortization Schedule */}
            {showAmortization && amortizationSchedule.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-cyan-50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" />
                    Amortization Schedule (First 5 Years)
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Breakdown of principal vs. interest payments over time
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Year
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Month
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Payment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Principal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Interest
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {amortizationSchedule.map((entry) => (
                        <tr key={entry.month} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {entry.year}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {entry.month}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(entry.payment)}
                          </td>
                          <td className="px-4 py-3 text-sm text-emerald-700">
                            {formatCurrency(entry.principal)}
                          </td>
                          <td className="px-4 py-3 text-sm text-orange-700">
                            {formatCurrency(entry.interest)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatCurrency(entry.remainingBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results & Actions */}
          <div className="space-y-6">
            <div className="overflow-hidden sticky top-24 space-y-6">
              {/* Results Summary */}
              {result && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-emerald-600 to-green-600">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 size={20} />
                      Results
                    </h2>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Monthly Payment */}
                    <div className="text-center p-4 bg-linear-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                      <p className="text-sm text-gray-600 mb-1">
                        Monthly Payment
                      </p>
                      <p className="text-xl font-bold text-emerald-700">
                        {formatCurrency(result.monthlyPayment)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">per month</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-gray-600">Total Payment</p>
                        <p className="text-base font-bold text-blue-700">
                          {formatCurrency(result.totalPayment)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="text-xs text-gray-600">Total Interest</p>
                        <p className="text-base font-bold text-orange-700">
                          {formatCurrency(result.totalInterest)}
                        </p>
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Payment Breakdown
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Principal</span>
                          <span className="font-medium text-xs text-gray-900">
                            {formatCurrency(result.loanAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Interest</span>
                          <span className="font-medium text-xs text-gray-900">
                            {formatCurrency(result.totalInterest)}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-900">
                              Total Cost
                            </span>
                            <span className="font-bold text-xs text-gray-900">
                              {formatCurrency(result.totalPayment)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interest Visualization */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Principal vs Interest
                        </span>
                        <span className="text-gray-500">
                          {(
                            (result.loanAmount / result.totalPayment) *
                            100
                          ).toFixed(1)}
                          % principal
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{
                            width: `${(result.loanAmount / result.totalPayment) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleExport}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
                        >
                          <Download size={14} />
                          Export
                        </button>
                        <button
                          onClick={handleShare}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium"
                        >
                          <Share2 size={14} />
                          Share
                        </button>
                      </div>

                      {saveToHistory && (
                        <button
                          onClick={handleSaveCalculation}
                          className="w-full px-4 py-3 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all font-medium shadow-lg hover:shadow-xl"
                        >
                          Save Calculation
                        </button>
                      )}

                      <button
                        onClick={() => setShowAmortization(!showAmortization)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                      >
                        <Calendar size={16} />
                        {showAmortization
                          ? 'Hide Schedule'
                          : 'View Amortization'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Tips & Information */}
              {showTips && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Info size={20} className="text-gray-600" />
                        Mortgage Tips
                      </h2>
                      <button
                        onClick={() => setShowTips(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <Percent size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Down Payment
                        </h4>
                        <p className="text-sm text-gray-600 mt-0.5">
                          A larger down payment reduces your loan amount and
                          monthly payments
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <TrendingUp size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Interest Rate
                        </h4>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Even a 1% difference can save you millions over the
                          loan term
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Clock size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Loan Term</h4>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Shorter terms mean higher payments but less total
                          interest paid
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Call to Action */}
            {/* <div className="bg-linear-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center space-y-3">
                <Shield size={24} className="mx-auto" />
                <h3 className="font-bold text-lg">Ready to Buy?</h3>
                <p className="text-sm opacity-90">
                  Get pre-approved for a mortgage with competitive rates
                </p>
                <button className="w-full px-4 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-gray-100 transition-all">
                  Apply Now
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              This calculator provides estimates only. Actual mortgage rates and
              terms may vary.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </footer>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <span className="font-medium text-gray-900">Calculating...</span>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          background-color: #059669;
          border-radius: 50%;
          border: 3px solid white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background-color: #059669;
          border-radius: 50%;
          border: 3px solid white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
