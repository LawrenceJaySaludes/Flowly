import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const TransactionContext = createContext()

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    supabase
      .from('transactions')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data }) => {
        if (data) setTransactions(data)
      })
  }, [])

  const addTransaction = useCallback((transaction) => {
    setTransactions((prev) => [transaction, ...prev])
  }, [])

  const removeTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const resetTransactions = useCallback(() => {
    setTransactions([])
  }, [])

  const toggleBalance = useCallback(() => {
    setShowBalance((prev) => !prev)
  }, [])

  return (
    <TransactionContext.Provider value={{ transactions, showBalance, toggleBalance, addTransaction, removeTransaction, resetTransactions }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (!context) throw new Error('useTransactions must be used within TransactionProvider')
  return context
}
