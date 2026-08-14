interface SkillTagProps {
  name: string
  variant: "user" | "matched" | "missing"
}

const variantStyles: Record<string, string> = {
  user: "bg-surface-200 text-surface-900 border-dark-border",
  matched: "bg-green-400/10 text-green-400 border-green-400/20",
  missing: "bg-red-400/10 text-red-400/70 border-red-400/20 line-through opacity-60",
}

const variantIcons: Record<string, string> = {
  user: "",
  matched: "✓ ",
  missing: "✗ ",
}

export function SkillTag({ name, variant }: SkillTagProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${variantStyles[variant]}`}
    >
      {variantIcons[variant]}
      {name}
    </span>
  )
}
