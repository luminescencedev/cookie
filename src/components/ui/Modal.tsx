import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { RiCloseLine } from "react-icons/ri"

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
          }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(12px)", background: "rgba(8,8,11,0.8)" }} />
          <motion.div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "448px",
              borderRadius: "16px",
              border: "1px solid var(--border-2)",
              padding: "24px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              background: "var(--surface)",
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 className="font-semibold font-display" style={{ fontSize: "1rem", color: "var(--text)" }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                style={{
                  borderRadius: "8px",
                  padding: "6px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <RiCloseLine size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
