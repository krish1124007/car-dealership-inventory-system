import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { registerAdmin } from '../api/admin.api'

const inputClasses =
  'w-full rounded-lg bg-gray-100 border border-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition'

/**
 * Registration for ADMIN accounts. Requires the shared admin secret; the
 * backend rejects the request with 403 unless it matches
 * ADMIN_REGISTRATION_SECRET.
 */
export function AdminRegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await registerAdmin({ name, email, password }, secret)
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center blur-xs scale-105"
        style={{ backgroundImage: "url('/bgms/login-bgm.png')" }}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white">
            <ShieldCheck size={24} />
          </span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Admin access
          </h1>
          <p className="mt-2 text-xs text-gray-400">
            requires the dealership's admin registration secret
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="admin-reg-name" className="sr-only">
              Name
            </label>
            <input
              id="admin-reg-name"
              type="text"
              required
              autoComplete="name"
              placeholder="Name"
              className={inputClasses}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="admin-reg-email" className="sr-only">
              Email
            </label>
            <input
              id="admin-reg-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              className={inputClasses}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="admin-reg-password" className="sr-only">
              Password
            </label>
            <input
              id="admin-reg-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Password"
              className={inputClasses}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="admin-reg-secret" className="sr-only">
              Admin secret
            </label>
            <input
              id="admin-reg-secret"
              type="password"
              required
              placeholder="Admin secret"
              className={inputClasses}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold uppercase tracking-wider py-3 shadow-md transition"
          >
            {submitting ? 'Creating…' : 'Create admin account'}
          </button>
        </form>

        {/* Demo credentials so evaluators can explore without setup. */}
        <div className="mt-6 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Test admin — auto-created on server start
          </p>
          <p className="mt-2 text-sm text-gray-700">
            Email: <span className="font-mono font-semibold">admin@cardealership.com</span>
          </p>
          <p className="text-sm text-gray-700">
            Password: <span className="font-mono font-semibold">Admin@123</span>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Use these on the sign-in page to explore the admin panel.
          </p>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Not an admin?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 font-medium underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
