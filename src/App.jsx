import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { TransactionProvider } from './context/TransactionContext.jsx'
import MainLayout from './layout/MainLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddTransaction from './pages/AddTransaction.jsx'
import TransactionHistory from './pages/TransactionHistory.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import { supabase } from './lib/supabase.js'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (isMounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void event
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-base font-medium text-textSecondary">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <TransactionProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TransactionProvider>
  )
}

export default App
