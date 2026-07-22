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

export function RegisterPage() {
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
    <AuthLayout
      title="Join the showroom"
      subtitle="Create an account to browse and purchase vehicles"
    >
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your full name"
            className={inputClasses}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={submitting} className={buttonClasses}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-blue-600 hover:text-emerald-600 font-medium"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
