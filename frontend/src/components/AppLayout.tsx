import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

/** Sidebar + content shell shared by every authenticated page. */
export function AppLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pl-16 lg:pl-64">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>
            {actions}
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}
