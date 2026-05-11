import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useTransactions } from '../context/TransactionContext.jsx'

function AddTransaction() {
  const navigate = useNavigate()
  const { addTransaction, transactions } = useTransactions()

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalBalance = totalIncome - totalExpense
  const isZeroBalance = totalBalance === 0

  const [type, setType] = useState('income')
  const inputClass =
    type === 'income'
      ? 'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-textPrimary outline-none ring-income transition focus:ring-2 hover:border-income'
      : 'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-textPrimary outline-none ring-expense transition focus:ring-2 hover:border-expense'

  useEffect(() => {
    if (isZeroBalance) {
      setType('income')
    }
  }, [isZeroBalance])

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [showCustomCategory, setShowCustomCategory] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!amount || !category) return

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type,
        amount: parseFloat(amount),
        category,
        note,
        date: date || new Date().toISOString().slice(0, 10),
        user_id: user.id,
      })
      .select()

    if (error) {
      console.error(error)
      setSaving(false)
      return
    }

    if (data && data[0]) addTransaction(data[0])

    setAmount('')
    setCategory('')
    setNote('')
    setDate(new Date().toISOString().slice(0, 10))
    setSaving(false)
    navigate('/')
  }

  return (
    <section className="space-y-4 pb-8">
      <form onSubmit={handleSubmit} className="card-surface space-y-4 p-5">
        <fieldset disabled={isZeroBalance}>
          <legend className="mb-2 block text-sm font-medium text-textSecondary">Type</legend>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setType('income')}
              className={[
                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                type === 'income' ? 'bg-card text-income shadow-soft' : 'text-textSecondary',
              ].join(' ')}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              disabled={isZeroBalance}
              className={[
                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                type === 'expense' ? 'bg-card text-expense shadow-soft' : 'text-textSecondary',
                isZeroBalance ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              Expense{isZeroBalance && ' (add income first)'}
            </button>
          </div>
        </fieldset>

        <div>
          <label htmlFor="amount" className="mb-2 block text-sm font-medium text-textSecondary">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
          <div className="mt-2 flex gap-2">
            {[50, 100, 500, 1000].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(String(value))}
                className={[
                  'rounded-lg px-3 py-1.5 text-sm font-semibold transition',
                  amount === String(value)
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-textSecondary hover:bg-slate-200',
                ].join(' ')}
              >
                {'\u20B1'}{value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-textSecondary">
            Category
          </label>
          {showCustomCategory ? (
            <div className="flex gap-2">
              <input
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Enter custom category"
                className={inputClass}
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomCategory(false)
                  setCategory('')
                }}
                className="rounded-xl bg-slate-100 px-3 text-sm font-medium text-textSecondary hover:bg-slate-200"
              >
                Back
              </button>
            </div>
          ) : (
            <select
              id="category"
              value={category}
              onChange={(event) => {
                const val = event.target.value
                if (val === '__add__') {
                  setShowCustomCategory(true)
                  setCategory('')
                } else {
                  setCategory(val)
                }
              }}
              className={inputClass}
            >
              <option value="" disabled>Select a category</option>
              {(type === 'income'
                ? ['Salary', 'Profit', 'Allowance']
                : ['Bills', 'Food', 'Transportation']
              ).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__add__">+ Add Category</option>
            </select>
          )}
        </div>

        <div>
          <label htmlFor="note" className="mb-2 block text-sm font-medium text-textSecondary">
            Note
          </label>
          <input
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional details"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-textSecondary">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Transaction'}
        </button>
      </form>
    </section>
  )
}

export default AddTransaction
