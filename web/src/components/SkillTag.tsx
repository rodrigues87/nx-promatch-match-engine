/**
 * Tag de skill — visual diferente por tipo (user, matched, missing).
 */

interface SkillTagProps {
  name: string
  variant: "user" | "matched" | "missing"
}

const variantStyles: Record<string, string> = {
  user: "bg-blue-50 text-blue-700 border-blue-200",
  matched: "bg-green-50 text-green-700 border-green-200",
  missing: "bg-red-50 text-red-500 border-red-200 line-through",
}

const variantIcons: Record<string, string> = {
  user: "",
  matched: "✓ ",
  missing: "✗ ",
}

export function SkillTag({ name, variant }: SkillTagProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${variantStyles[variant]}`}
    >
      {variantIcons[variant]}
      {name}
    </span>
  )
}
