import { create } from "zustand"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface ToastStore {
  toasts: Toast[]
  toast: (message: string, type?: Toast["type"]) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast(message, type = "info") {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      3500,
    )
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
