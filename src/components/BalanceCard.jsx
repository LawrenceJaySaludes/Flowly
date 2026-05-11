import { Eye, EyeOff } from 'lucide-react'
import { useTransactions } from '../context/TransactionContext.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'

function BalanceCard({ totalBalance, totalIncome, totalExpense }) {
  const { showBalance, toggleBalance } = useTransactions()
  const isZeroBalance = totalBalance === 0

  return (
    <section className="card-surface overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-emerald-500 px-5 py-5 text-white">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/90">Total Balance</p>
          <button
            onClick={toggleBalance}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/20"
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <div className="mt-1">
          <p className="text-4xl font-semibold tracking-tight">
            {showBalance ? formatCurrency(totalBalance) : '****'}
          </p>
          {isZeroBalance && (
            <p className="mt-2 text-center text-xs font-medium bg-white/20 px-3 py-1 rounded-full w-fit">
              go to settings to add balance
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <article className="rounded-xl bg-green-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Income</p>
          <p className="mt-1 text-lg font-semibold text-income">
            {showBalance ? formatCurrency(totalIncome) : '****'}
          </p>
        </article>
        <article className="rounded-xl bg-rose-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Expense</p>
          <p className="mt-1 text-lg font-semibold text-expense">
            {showBalance ? formatCurrency(totalExpense) : '****'}
          </p>
        </article>
      </div>
    </section>
  )
}

export default BalanceCard
