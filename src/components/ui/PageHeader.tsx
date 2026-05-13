interface Props {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, description, action }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
      <div>
        <h1 className="text-xl font-semibold font-display" style={{ color: "var(--text)" }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm" style={{ color: "var(--muted)", marginTop: "4px" }}>{description}</p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
