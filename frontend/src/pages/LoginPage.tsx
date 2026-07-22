import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  AuthLayout,
  FieldLabel,
  ErrorBanner,
  inputClasses,
  buttonClasses,
} from './AuthLayout'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to browse the showroom">
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClasses}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={submitting} className={buttonClasses}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        New here?{' '}
        <Link
          to="/register"
          className="text-blue-600 hover:text-emerald-600 font-medium"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
