import { createContext, useContext, useState, useCallback } from "react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface ToastContextValue {
  toast: (message: string, type?: Toast["type"]) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
              t.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : t.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-white border-neutral-200 text-neutral-700"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be inside ToastProvider")
  return ctx.toast
}
