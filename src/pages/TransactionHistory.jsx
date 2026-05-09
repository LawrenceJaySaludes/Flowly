import TransactionItem from '../components/TransactionItem.jsx'
import { useTransactions } from '../context/TransactionContext.jsx'

function TransactionHistory() {
  const { transactions } = useTransactions()

  return (
    <section className="space-y-4 pb-16">
      <h2 className="text-center text-lg font-bold text-textPrimary">All Transactions History</h2>
      {transactions.length === 0 ? (
        <p className="text-center text-textSecondary">No transactions yet.</p>
      ) : (
        <ul className="space-y-3">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} {...transaction} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default TransactionHistory
