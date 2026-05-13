import { motion } from "motion/react"

interface Props {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md"
  loading?: boolean
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  style?: React.CSSProperties
  children?: React.ReactNode
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "var(--bg)",
    fontWeight: 600,
    border: "none",
  },
  secondary: {
    background: "transparent",
    color: "var(--text)",
    border: "1px solid var(--border-2)",
  },
  ghost: {
    background: "transparent",
    color: "var(--muted)",
    border: "none",
  },
  danger: {
    background: "transparent",
    color: "var(--red)",
    border: "1px solid rgba(248,113,113,0.25)",
  },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: "0.75rem" },
  md: { padding: "8px 16px", fontSize: "0.875rem" },
}

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  type = "button",
  onClick,
  style,
  children,
}: Props) {
  const isDisabled = loading || disabled

  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: 500,
        borderRadius: "8px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
        userSelect: "none",
        fontFamily: "inherit",
        transition: "background 0.15s, color 0.15s",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {loading ? (
        <>
          <span style={{
            width: "14px",
            height: "14px",
            borderRadius: "9999px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
            display: "inline-block",
            flexShrink: 0,
          }} />
          Loading…
        </>
      ) : children}
    </motion.button>
  )
}
