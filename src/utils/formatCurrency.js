export function formatCurrency(value) {
  const amount = Number(value) || 0
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return `\u20B1${formattedAmount}`
}
