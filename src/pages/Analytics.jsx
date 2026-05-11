import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTransactions } from '../context/TransactionContext.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'

const CATEGORY_EMOJIS = {
  Food: '\uD83C\uDF54',
  Transportation: '\uD83D\uDE97',
  Bills: '\uD83D\uDCC4',
  Shopping: '\uD83D\uDECD\uFE0F',
  Entertainment: '\uD83C\uDFAC',
  Health: '\uD83D\uDC8A',
  Education: '\uD83D\uDCDA',
  Salary: '\uD83D\uDCB0',
  Profit: '\uD83D\uDCC8',
  Allowance: '\uD83C\uDF81',
}

const FALLBACK_EMOJI = '\uD83D\uDCCC'

const COLORS = [
  '#22C55E', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#6366F1', '#84CC16',
]

function Skeleton() {
  return (
    <section className="space-y-5 pb-8">
      <div className="card-surface animate-pulse p-5">
        <div className="mb-2 h-3 w-24 rounded bg-slate-200" />
        <div className="mb-1 h-8 w-36 rounded bg-slate-200" />
        <div className="mt-3 h-3 w-28 rounded bg-slate-200" />
      </div>
      <div className="card-surface animate-pulse p-5">
        <div className="mb-4 h-3 w-40 rounded bg-slate-200" />
        <div className="mx-auto h-60 w-60 rounded-full bg-slate-200" />
      </div>
      <div className="card-surface animate-pulse space-y-3 p-5">
        <div className="mb-4 h-3 w-20 rounded bg-slate-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-200" />
            <div className="flex-1">
              <div className="mb-1 h-4 w-20 rounded bg-slate-200" />
              <div className="h-3 w-16 rounded bg-slate-200" />
            </div>
            <div className="h-4 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <section className="flex flex-col items-center justify-center py-16">
      <span className="mb-4 text-5xl">{'\uD83D\uDCCA'}</span>
      <p className="text-base font-medium text-textPrimary">No expense data yet</p>
      <p className="mt-1 text-sm text-textSecondary">Start tracking your expenses to see insights here.</p>
    </section>
  )
}

function Analytics() {
  const { transactions } = useTransactions()

  const expenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense'),
    [transactions],
  )

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, t) => sum + t.amount, 0),
    [expenses],
  )

  const categoryData = useMemo(() => {
    const groups = {}
    expenses.forEach((t) => {
      groups[t.category] = (groups[t.category] || 0) + t.amount
    })
    return Object.entries(groups)
      .map(([category, total]) => ({
        category,
        total,
        percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [expenses, totalExpenses])

  const topCategory = categoryData[0]?.category ?? null

  if (transactions.length === 0) return <Skeleton />

  if (expenses.length === 0) return <EmptyState />

  return (
    <section className="space-y-5 pb-8">
      <div className="card-surface p-5 transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
              Total Expenses
            </p>
            <p className="mt-1 text-2xl font-bold text-expense">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          {topCategory && (
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
                Top Spending
              </p>
              <p className="mt-1 text-sm font-semibold text-textPrimary">
                {CATEGORY_EMOJIS[topCategory] || FALLBACK_EMOJI} {topCategory}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card-surface p-5 transition hover:shadow-md">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-textSecondary">
          Spending Distribution
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="total"
              nameKey="category"
              animationBegin={0}
              animationDuration={600}
            >
              {categoryData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={COLORS[categoryData.indexOf(entry) % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCurrency(value), name]}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {categoryData.map((entry) => (
            <div key={entry.category} className="flex items-center gap-1.5 text-xs text-textSecondary">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[categoryData.indexOf(entry) % COLORS.length] }}
              />
              {entry.category}
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-5 transition hover:shadow-md">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-textSecondary">
          Breakdown
        </h3>
        <div className="space-y-1">
          {categoryData.map((item) => (
            <div
              key={item.category}
              className="group flex cursor-pointer items-center justify-between rounded-xl p-3 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-base transition group-hover:scale-110"
                  style={{
                    backgroundColor: `${COLORS[categoryData.indexOf(item) % COLORS.length]}18`,
                  }}
                >
                  {CATEGORY_EMOJIS[item.category] || FALLBACK_EMOJI}
                </div>
                <div>
                  <p className="text-sm font-medium text-textPrimary">{item.category}</p>
                  <p className="text-xs text-textSecondary">{item.percentage}% of spending</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-textPrimary">
                  {formatCurrency(item.total)}
                </p>
                <div className="mt-0.5 h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: COLORS[categoryData.indexOf(item) % COLORS.length],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Analytics
