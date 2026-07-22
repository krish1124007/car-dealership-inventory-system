import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

type ToastKind = 'success' | 'error'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
}

// No-op default so components (and their tests) never crash when rendered
// outside the provider — toasts simply don't appear.
const noop = () => {}
const ToastContext = createContext<ToastContextValue>({
  success: noop,
  error: noop,
})

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, kind, message }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  const success = useCallback(
    (message: string) => push('success', message),
    [push],
  )
  const error = useCallback((message: string) => push('error', message), [push])

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-3 bg-white border rounded-xl shadow-lg p-4 ${
              toast.kind === 'error' ? 'border-red-200' : 'border-emerald-200'
            }`}
          >
            {toast.kind === 'error' ? (
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
            ) : (
              <CheckCircle2
                size={18}
                className="shrink-0 mt-0.5 text-emerald-500"
              />
            )}
            <p className="flex-1 text-sm text-gray-800">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="shrink-0 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}
