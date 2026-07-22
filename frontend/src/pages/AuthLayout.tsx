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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.15),_transparent_60%)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🚗</span>
          <h1 className="mt-3 text-3xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-slate-400">{subtitle}</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur">
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
      className="block text-sm font-medium text-slate-300 mb-1.5"
    >
      {children}
    </label>
  )
}

export const inputClasses =
  'w-full rounded-lg bg-slate-800/80 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

export const buttonClasses =
  'w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 transition'

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3.5 py-2.5"
    >
      {message}
    </p>
  )
}
