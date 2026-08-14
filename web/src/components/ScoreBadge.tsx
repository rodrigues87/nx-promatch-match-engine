interface ScoreBadgeProps {
  score: number
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const percent = Math.round(score * 100)

  let colorClass: string
  if (percent >= 80) {
    colorClass = "text-green-400 bg-green-400/10 border-green-400/20"
  } else if (percent >= 60) {
    colorClass = "text-accent bg-accent-glow border-accent/20"
  } else {
    colorClass = "text-surface-800 bg-surface-200 border-dark-border"
  }

  return (
    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${colorClass}`}>
      {percent}%
    </span>
  )
}
