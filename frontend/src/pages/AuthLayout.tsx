import type { ReactNode } from 'react'

/** Shared centered-card shell for the login and register screens. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.08),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.08),_transparent_50%)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-3xl shadow-lg shadow-blue-200">
            🚗
          </span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-gray-500">{subtitle}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-blue-100/60">
          {children}
        </div>
      </div>
    </div>
  )
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 mb-1.5"
    >
      {children}
    </label>
  )
}

export const inputClasses =
  'w-full rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition'

export const buttonClasses =
  'w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 shadow-md shadow-blue-200 transition'

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-3.5 py-2.5"
    >
      {message}
    </p>
  )
}
