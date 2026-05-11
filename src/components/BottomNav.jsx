import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, List } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/add', label: '', icon: '+' },
  { path: '/transactions', label: 'History', Icon: List },
]

function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[420px] grid-cols-3 items-center py-2">
        {navItems.map((item) => {
          if (item.icon === '+') {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-2xl font-light text-white shadow-md transition hover:scale-105 hover:shadow-lg active:scale-95"
                aria-label="Add transaction"
              >
                +
              </button>
            )
          }

          const isActive = pathname === item.path
          const Icon = item.Icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={[
                'mx-auto flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition',
                isActive ? 'text-primary' : 'text-textSecondary hover:text-textPrimary',
              ].join(' ')}
            >
              <span className="text-lg">
                <Icon size={22} strokeWidth={1.5} />
              </span>
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
