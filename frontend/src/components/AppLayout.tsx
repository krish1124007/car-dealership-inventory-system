import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

/** Top-navbar + content shell shared by every page. */
export function AppLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {(title || actions) && (
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              {title && (
                <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {actions}
          </header>
        )}
        {children}
      </main>
    </div>
  )
}
