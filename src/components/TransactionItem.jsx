import { formatCurrency } from '../utils/formatCurrency.js'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function TransactionItem({ category, note, amount, type, date }) {
  const isIncome = type === 'income'

  return (
    <li className="card-surface flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-textPrimary">{category}</p>
        <p className="truncate text-sm text-textSecondary">{note}</p>
        {date && <p className="mt-0.5 text-xs text-textSecondary/60">{formatDate(date)}</p>}
      </div>
      <p className={`shrink-0 text-base font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
        {isIncome ? '+' : '-'}
        {formatCurrency(amount)}
      </p>
    </li>
  )
}

export default TransactionItem
