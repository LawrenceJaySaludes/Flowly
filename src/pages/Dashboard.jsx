import BalanceCard from '../components/BalanceCard.jsx'
import TransactionItem from '../components/TransactionItem.jsx'
import { useTransactions } from '../context/TransactionContext.jsx'

function Dashboard() {
  const { transactions } = useTransactions()

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalBalance = totalIncome - totalExpense

  return (
    <section className="space-y-5">
      <BalanceCard
        totalBalance={totalBalance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />
      <div className="space-y-3">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-textSecondary">Recent Transactions</p>
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-textSecondary">No transactions yet</p>
        ) : (
          <ul className="space-y-3">
            {transactions.slice(0, 4).map((transaction) => (
              <TransactionItem key={transaction.id} {...transaction} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default Dashboard
