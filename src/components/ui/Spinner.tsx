export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-4", md: "size-5", lg: "size-8" }
  return (
    <div
      className={`${sizes[size]} rounded-full border-2 border-neutral-200 border-t-neutral-800 animate-spin`}
    />
  )
}
