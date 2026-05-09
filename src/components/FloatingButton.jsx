import { Link } from 'react-router-dom'

function FloatingButton() {
  return (
    <Link
      to="/add"
      aria-label="Add transaction"
      className="fixed bottom-6 right-[max(1rem,calc(50%-194px))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-3xl font-medium leading-none text-white shadow-soft transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      +
    </Link>
  )
}

export default FloatingButton
