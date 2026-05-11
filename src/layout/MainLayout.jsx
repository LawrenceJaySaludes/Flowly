import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import Header from '../components/Header.jsx'
import BottomNav from '../components/BottomNav.jsx'

function MainLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const pageTitle =
    pathname === '/' ? 'Dashboard' :
    pathname === '/transactions' ? 'History' :
    pathname === '/settings' ? 'Settings' : ''
  const isAddPage = pathname === '/add'

  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] px-4 pb-24 pt-6">
      <Header
        title={isAddPage ? 'Add Transaction' : pageTitle}
        rightElement={
          <button
            onClick={() => navigate('/settings')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg transition hover:bg-slate-200"
            aria-label="Settings"
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>
        }
      />
      <main className="space-y-5">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default MainLayout
