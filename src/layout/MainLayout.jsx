import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import BottomNav from '../components/BottomNav.jsx'

function MainLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAddPage = pathname === '/add'

  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] px-4 pb-24 pt-6">
      <Header
        title={isAddPage ? 'Add Transaction' : 'Flowly'}
        rightElement={
          <button
            onClick={() => navigate('/settings')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg transition hover:bg-slate-200"
            aria-label="Settings"
          >
            ⚙️
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
