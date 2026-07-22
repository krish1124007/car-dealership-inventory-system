import type { ReactNode } from 'react'

/**
 * Shared shell for the auth screens: softly blurred full-bleed background
 * photo with a solid white rounded card centered on top.
 */
export function AuthLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center blur-xs scale-105"
        style={{ backgroundImage: "url('/bgms/login-bgm.png')" }}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-2xl">
            🚗
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-gray-800 tracking-tight">
            {title}
          </h1>
        </div>
        {children}
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
      className="block text-sm text-gray-600 mb-1.5"
    >
      {children}
    </label>
  )
}

export const inputClasses =
  'w-full rounded-xl bg-white border border-gray-200 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition'

export const buttonClasses =
  'w-full rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 shadow-md transition'

export const linkClasses =
  'text-blue-600 hover:text-blue-500 font-medium underline underline-offset-2'

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
