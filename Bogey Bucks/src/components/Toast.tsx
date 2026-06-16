import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/** Lightweight toast system for vibey golf/betting notifications. */

interface ToastItem {
  id: number
  message: string
}

interface ToastApi {
  push: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const push = useCallback((message: string) => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, message }])
    // Auto-dismiss after the toast animation completes (~3.6s).
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3600)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-3 pt-2 safe-top">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-toast pointer-events-auto w-full max-w-md rounded-xl border border-gold-500/40 bg-fairway-800/95 px-4 py-3 text-center text-sm font-semibold text-gold-200 shadow-xl shadow-black/40 backdrop-blur"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
