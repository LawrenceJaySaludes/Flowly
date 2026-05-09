import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase.js'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../context/TransactionContext.jsx'

function Settings() {
  const navigate = useNavigate()
  const { transactions, resetTransactions } = useTransactions()

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalBalance = totalIncome - totalExpense

  const handleAddBalance = () => {
    navigate('/add')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleReset = async () => {
    const result = await Swal.fire({
      title: 'Reset all transactions?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      iconColor: '#ef4444',
      confirmButtonText: 'Yes, reset',
    })

    if (!result.isConfirmed) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('transactions').delete().eq('user_id', user.id)
    if (error) {
      console.error(error)
      return
    }

    resetTransactions()
  }

  return (
    <section className="space-y-4 pb-16">
      <h2 className="text-center text-lg font-bold text-textPrimary">Settings</h2>

      <div className="card-surface space-y-3 p-5">
        {totalBalance === 0 && (
          <button
            onClick={handleAddBalance}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Add Balance
          </button>
        )}

        <button
          onClick={handleReset}
          className="w-full rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600"
        >
          Reset All Transactions
        </button>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </section>
  )
}

export default Settings
