// components/CalculationHistory.tsx
import { JSX, useEffect, useState } from 'react'
import { ApiResponse, Calculation } from '@/types/mortgage'

interface CalculationHistoryProps {
  userId: string
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-NG')
}

export default function CalculationHistory({
  userId,
}: CalculationHistoryProps): JSX.Element {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      try {
        setLoading(true)
        const response = await fetch(`/api/calculator/history?userId=${userId}`)
        const data: ApiResponse<Calculation[]> = await response.json()

        if (data.success && data.calculations) {
          setCalculations(data.calculations)
        } else {
          setError(data.error || 'Failed to load history')
        }
      } catch (err) {
        setError('Error fetching calculation history')
        console.error('History fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchHistory()
    }
  }, [userId])

  if (loading) {
    return <div className="p-4 text-center">Loading history...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Calculation History</h3>

      {calculations.length === 0 ? (
        <p className="text-gray-500">No calculations saved yet.</p>
      ) : (
        <div className="space-y-3">
          {calculations.map((calculation) => (
            <div key={calculation.$id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {calculation.calculationType === 'mortgage'
                      ? 'Mortgage'
                      : 'Installment'}{' '}
                    Calculation
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(calculation.calculationDate)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    calculation.calculationType === 'mortgage'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {calculation.calculationType}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Property Price:</span>
                  <p className="font-semibold">
                    {formatCurrency(calculation.propertyPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Monthly Payment:</span>
                  <p className="font-semibold">
                    {formatCurrency(calculation.monthlyPayment)}
                  </p>
                </div>

                {calculation.calculationType === 'mortgage' && (
                  <>
                    <div>
                      <span className="text-gray-600">Loan Amount:</span>
                      <p className="font-semibold">
                        {formatCurrency(calculation.loanAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Interest Rate:</span>
                      <p className="font-semibold">
                        {calculation.interestRate}%
                      </p>
                    </div>
                  </>
                )}

                {calculation.calculationType === 'installment' && (
                  <>
                    <div>
                      <span className="text-gray-600">Deposit:</span>
                      <p className="font-semibold">
                        {calculation.depositPercent}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Months:</span>
                      <p className="font-semibold">{calculation.months}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
