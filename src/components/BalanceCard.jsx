function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function BalanceCard({ totalBalance, totalIncome, totalExpense }) {
  const isZeroBalance = totalBalance === 0

  return (
    <section className="card-surface overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-emerald-500 px-5 py-5 text-white">
        <p className="text-sm font-medium text-white/90">Total Balance</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-4xl font-semibold tracking-tight">{formatCurrency(totalBalance)}</p>
          {isZeroBalance && (
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              go to settings to add balance
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <article className="rounded-xl bg-green-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Income</p>
          <p className="mt-1 text-lg font-semibold text-income">{formatCurrency(totalIncome)}</p>
        </article>
        <article className="rounded-xl bg-rose-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Expense</p>
          <p className="mt-1 text-lg font-semibold text-expense">{formatCurrency(totalExpense)}</p>
        </article>
      </div>
    </section>
  )
}

export default BalanceCard
