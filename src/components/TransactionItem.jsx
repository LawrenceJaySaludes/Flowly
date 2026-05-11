import { Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase.js'
import { useTransactions } from '../context/TransactionContext.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function TransactionItem({ id, category, note, amount, type, date }) {
  const isIncome = type === 'income'
  const { showBalance, removeTransaction } = useTransactions()

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete transaction?',
      text: `This will ${isIncome ? 'deduct' : 'refund'} ${showBalance ? formatCurrency(amount) : '****'} from your balance.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      iconColor: '#ef4444',
      confirmButtonText: 'Yes, delete',
    })

    if (!result.isConfirmed) return

    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      Swal.fire('Error', 'Failed to delete transaction.', 'error')
      return
    }

    removeTransaction(id)
  }

  return (
    <li className="card-surface flex items-center justify-between gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-textPrimary">{category}</p>
        <p className="truncate text-sm text-textSecondary">{note}</p>
        {date && <p className="mt-0.5 text-xs text-textSecondary/60">{formatDate(date)}</p>}
      </div>
      <div className="flex items-center gap-3">
        <p className={`shrink-0 text-base font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
          {showBalance ? `${isIncome ? '+' : '-'}${formatCurrency(amount)}` : '****'}
        </p>
        <button
          onClick={handleDelete}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-expense"
          aria-label="Delete transaction"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  )
}

export default TransactionItem
