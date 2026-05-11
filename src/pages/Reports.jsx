import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useTransactions } from '../context/TransactionContext.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'

function Skeleton() {
  return (
    <section className="space-y-5 pb-8">
      <div className="card-surface animate-pulse p-5">
        <div className="mb-2 h-3 w-32 rounded bg-slate-200" />
        <div className="mx-auto h-48 w-full rounded bg-slate-200" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="card-surface animate-pulse space-y-2 p-5">
          <div className="mb-3 h-4 w-28 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-3 w-16 rounded bg-slate-200" />
        </div>
      ))}
      <div className="card-surface animate-pulse p-5">
        <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
        <div className="h-3 w-40 rounded bg-slate-200" />
        <div className="mt-2 h-3 w-36 rounded bg-slate-200" />
        <div className="mt-2 h-3 w-44 rounded bg-slate-200" />
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <section className="flex flex-col items-center justify-center py-16">
      <span className="mb-4 text-5xl">{'\uD83D\uDCC5'}</span>
      <p className="text-base font-medium text-textPrimary">No monthly reports available yet</p>
      <p className="mt-1 text-sm text-textSecondary">Add some transactions to see your monthly insights.</p>
    </section>
  )
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatMonthYear(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function getMonthTimestamp(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.getFullYear() * 12 + d.getMonth()
}

function Reports() {
  const { transactions } = useTransactions()

  const monthlyData = useMemo(() => {
    const groups = {}
    transactions.forEach((t) => {
      const key = formatMonthYear(t.date)
      if (!groups[key]) {
        groups[key] = { label: key, income: 0, expenses: 0, savings: 0, count: 0, ts: getMonthTimestamp(t.date) }
      }
      if (t.type === 'income') {
        groups[key].income += t.amount
      } else {
        groups[key].expenses += t.amount
      }
      groups[key].count += 1
    })
    return Object.values(groups)
      .sort((a, b) => a.ts - b.ts)
      .map((m) => ({ ...m, savings: m.income - m.expenses }))
  }, [transactions])

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )

  const totalExpenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )

  const insights = useMemo(() => {
    if (monthlyData.length === 0) return []

    const result = []

    const highestSpending = [...monthlyData].sort((a, b) => b.expenses - a.expenses)[0]
    result.push(`Highest spending month: ${highestSpending.label.split(' ')[0]}`)

    const bestSavings = [...monthlyData]
      .filter((m) => m.savings > 0)
      .sort((a, b) => b.savings - a.savings)
    if (bestSavings.length > 0) {
      result.push(`Best savings month: ${bestSavings[0].label.split(' ')[0]}`)
    }

    const mostTransactions = [...monthlyData].sort((a, b) => b.count - a.count)[0]
    if (mostTransactions.count > 1) {
      result.push(`Most transactions: ${mostTransactions.count} in ${mostTransactions.label.split(' ')[0]}`)
    }

    const topCategoryByMonth = {}
    transactions.forEach((t) => {
      if (t.type !== 'expense') return
      const key = formatMonthYear(t.date)
      if (!topCategoryByMonth[key]) topCategoryByMonth[key] = {}
      topCategoryByMonth[key][t.category] = (topCategoryByMonth[key][t.category] || 0) + t.amount
    })
    const sortedMonths = Object.keys(topCategoryByMonth).sort((a, b) => getMonthTimestamp(a) - getMonthTimestamp(b))
    if (sortedMonths.length > 0) {
      const last = sortedMonths[sortedMonths.length - 1]
      const cats = Object.entries(topCategoryByMonth[last]).sort((a, b) => b[1] - a[1])
      if (cats.length > 0) {
        result.push(`You spent the most on ${cats[0][0]} this month`)
      }
    }

    if (monthlyData.length > 1) {
      const avg = monthlyData.reduce((s, m) => s + m.expenses, 0) / monthlyData.length
      result.push(`Average monthly spending: ${formatCurrency(Math.round(avg))}`)
    }

    return result
  }, [monthlyData, transactions])

  if (transactions.length === 0) return <Skeleton />

  if (monthlyData.length === 0) return <EmptyState />

  return (
    <section className="space-y-5 pb-8">
      <div className="card-surface p-5 transition hover:shadow-md">
        <div className="mb-1 flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">All Time</p>
        </div>
        <div className="flex items-baseline gap-6">
          <div>
            <p className="text-xs text-income font-medium">Income</p>
            <p className="text-lg font-bold text-income">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-expense font-medium">Expenses</p>
            <p className="text-lg font-bold text-expense">{formatCurrency(totalExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-primary font-medium">Saved</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalIncome - totalExpenses)}</p>
          </div>
        </div>
      </div>

      {monthlyData.length > 1 && (
        <div className="card-surface p-5 transition hover:shadow-md">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-textSecondary">
            Monthly Overview
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickFormatter={(val) => val.split(' ')[0].slice(0, 3)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="income" name="Income" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" name="Savings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        {[...monthlyData].reverse().map((month) => (
          <div
            key={month.label}
            className="card-surface p-5 transition hover:shadow-md"
          >
            <h4 className="mb-2 text-sm font-bold text-textPrimary">{month.label}</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-income font-medium">Income</span>
                <span className="font-semibold text-income">{formatCurrency(month.income)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-expense font-medium">Expenses</span>
                <span className="font-semibold text-expense">{formatCurrency(month.expenses)}</span>
              </div>
              <div className="border-t border-slate-100 pt-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary font-medium">Saved</span>
                  <span className="font-semibold text-primary">{formatCurrency(month.savings)}</span>
                </div>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-textSecondary">{month.count} transaction{month.count !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      {insights.length > 0 && (
        <div className="card-surface p-5 transition hover:shadow-md">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-textSecondary">
            Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-sm text-textPrimary transition hover:bg-slate-100"
              >
                <span className="mt-0.5 shrink-0">{'\uD83D\uDCA1'}</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default Reports
