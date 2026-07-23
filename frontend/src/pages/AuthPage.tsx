import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Car, Zap } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { DEMO_ADMIN, demoLoginEnabled } from '../auth/demoCredentials'

const inputClasses =
  'w-full rounded-lg bg-gray-100 border border-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition'

const solidPill =
  'rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold uppercase tracking-wider px-10 py-2.5 shadow-md transition'

const outlinePill =
  'rounded-full border-2 border-white/90 text-white text-sm font-semibold uppercase tracking-wider px-10 py-2.5 hover:bg-white hover:text-blue-600 transition'

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 text-left"
    >
      {message}
    </p>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function signIn(withEmail: string, withPassword: string) {
    setError(null)
    setSubmitting(true)
    try {
      await login(withEmail, withPassword)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await signIn(email, password)
  }

  /** One click straight into the admin panel — no typing for reviewers. */
  async function handleDemoAdmin() {
    setEmail(DEMO_ADMIN.email)
    setPassword(DEMO_ADMIN.password)
    await signIn(DEMO_ADMIN.email, DEMO_ADMIN.password)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xs mx-auto text-center space-y-4"
    >
      <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white">
        <Car size={22} />
      </span>
      <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
      <p className="text-xs text-gray-400">use your account credentials</p>
      {error && <ErrorBanner message={error} />}
      <div className="space-y-3">
        <label htmlFor="login-email" className="sr-only">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className={inputClasses}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="login-password" className="sr-only">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          className={inputClasses}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" disabled={submitting} className={solidPill}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>

      {demoLoginEnabled && (
        <div className="pt-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400">
              or
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <button
            type="button"
            onClick={handleDemoAdmin}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold px-6 py-2.5 transition"
          >
            <Zap size={15} />
            Log in as demo admin
          </button>
          <p className="text-[11px] text-gray-400">
            Opens the admin panel instantly — no credentials to type.
          </p>
        </div>
      )}
    </form>
  )
}

function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xs mx-auto text-center space-y-4"
    >
      <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white">
        <Car size={22} />
      </span>
      <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
      <p className="text-xs text-gray-400">create your account to get started</p>
      {error && <ErrorBanner message={error} />}
      <div className="space-y-3">
        <label htmlFor="register-name" className="sr-only">
          Name
        </label>
        <input
          id="register-name"
          type="text"
          required
          autoComplete="name"
          placeholder="Name"
          className={inputClasses}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="register-email" className="sr-only">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className={inputClasses}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="register-password" className="sr-only">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Password (min 6 characters)"
          className={inputClasses}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" disabled={submitting} className={solidPill}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}

/**
 * Double-slider auth card: the form lives in one half and the blue overlay
 * in the other. Navigating between /login and /register keeps this same
 * component mounted, so the two halves animate across each other.
 */
export function AuthPage() {
  const location = useLocation()
  const isRegister = location.pathname === '/register'

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center blur-xs scale-105"
        style={{ backgroundImage: "url('/bgms/login-bgm.png')" }}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:block md:h-[560px]">
        {/* Form half: left in login mode, slides right in register mode. */}
        <div
          className={`flex items-center justify-center p-8 sm:p-10 md:absolute md:top-0 md:left-0 md:w-1/2 md:h-full transition-transform duration-700 ease-in-out ${
            isRegister ? 'md:translate-x-full' : 'md:translate-x-0'
          }`}
        >
          {isRegister ? <RegisterForm /> : <LoginForm />}
        </div>

        {/* Blue overlay: right in login mode, slides left in register mode. */}
        <div
          className={`bg-gradient-to-br from-blue-500 to-blue-700 text-white flex flex-col items-center justify-center text-center gap-4 p-8 sm:p-10 md:absolute md:top-0 md:left-1/2 md:w-1/2 md:h-full transition-transform duration-700 ease-in-out ${
            isRegister ? 'md:-translate-x-full' : 'md:translate-x-0'
          }`}
        >
          {isRegister ? (
            <>
              <h2 className="text-3xl font-bold">Welcome Back!</h2>
              <p className="text-blue-100 text-sm max-w-xs">
                Already have an account? Sign in and pick up right where you
                left off.
              </p>
              <Link to="/login" className={outlinePill}>
                Sign In
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold">Hello, Friend!</h2>
              <p className="text-blue-100 text-sm max-w-xs">
                Enter your personal details and start your journey with us.
              </p>
              <Link to="/register" className={outlinePill}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <Link
        to="/admin/register"
        className="relative text-xs text-white/80 hover:text-white underline underline-offset-2 drop-shadow"
      >
        Admin access
      </Link>
    </div>
  )
}
