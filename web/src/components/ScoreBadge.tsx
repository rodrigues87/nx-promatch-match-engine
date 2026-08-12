/**
 * Badge de score — cor muda conforme nível de compatibilidade.
 */

interface ScoreBadgeProps {
  score: number
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const percent = Math.round(score * 100)

  let colorClass: string
  if (percent >= 80) {
    colorClass = "bg-green-100 text-green-800 border-green-300"
  } else if (percent >= 60) {
    colorClass = "bg-yellow-100 text-yellow-800 border-yellow-300"
  } else {
    colorClass = "bg-red-100 text-red-700 border-red-300"
  }

  return (
    <span
      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${colorClass}`}
    >
      {percent}%
    </span>
  )
}
