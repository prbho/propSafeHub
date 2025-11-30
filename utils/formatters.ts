// utils/formatters.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-NG').format(number)
}
