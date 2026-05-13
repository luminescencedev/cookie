import { motion } from "motion/react"

interface Props {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md"
  loading?: boolean
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  children?: React.ReactNode
}

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none"

const variants: Record<string, string> = {
  primary:   "bg-neutral-900 text-white hover:bg-black",
  secondary: "border border-neutral-200 text-neutral-800 bg-white hover:bg-black/5",
  ghost:     "text-neutral-500 hover:bg-black/5 hover:text-neutral-800",
  danger:    "border border-red-200 text-red-600 bg-white hover:bg-red-50",
}

const sizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
}

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  type = "button",
  onClick,
  className = "",
  children,
}: Props) {
  const isDisabled = loading || disabled

  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.01 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <>
          <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
          Loading…
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
