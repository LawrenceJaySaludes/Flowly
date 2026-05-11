import { supabase } from '../lib/supabase.js'

function Login() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] items-center px-4 py-8">
      <section className="card-surface w-full p-7 text-center">
        <img src="/flowly.svg" alt="Flowly" className="mx-auto mb-4 h-16 w-auto" />
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Personal Finance Tracker</h1>
        <p className="mt-2 text-sm text-textSecondary">Track your money, effortlessly</p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-textPrimary transition hover:bg-slate-50"
        >
          <i className="bi bi-google text-base text-primary"></i>
            Continue with Google
        </button>
      </section>
    </div>
  )
}

export default Login
