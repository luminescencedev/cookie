import { AnimatePresence, motion } from "motion/react"
import { RiCheckLine, RiErrorWarningLine, RiInformationLine, RiCloseLine } from "react-icons/ri"
import { useToastStore } from "../../lib/toast-store"

const icons = {
  success: RiCheckLine,
  error: RiErrorWarningLine,
  info: RiInformationLine,
}

const styles = {
  success: "bg-white border-green-200 text-green-800",
  error:   "bg-white border-red-200 text-red-700",
  info:    "bg-white border-neutral-200 text-neutral-700",
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={`flex items-center gap-2.5 pl-3 pr-2 py-2.5 rounded-xl border text-sm shadow-sm min-w-55 max-w-xs ${styles[t.type]}`}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 flex items-center justify-center size-5 rounded-md text-current opacity-50 hover:opacity-100 transition-opacity"
              >
                <RiCloseLine size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/** @deprecated Use useToastStore instead */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

export function useToast() {
  return useToastStore((s) => s.toast)
}
