import { MockMatch } from "@/mocks/matches"
import { SkillTag } from "./SkillTag"
import { ScoreBadge } from "./ScoreBadge"

interface MatchCardProps {
  match: MockMatch
}

export function MatchCard({ match }: MatchCardProps) {
  const salaryText = match.jobSalary
    ? `R$ ${match.jobSalary.min.toLocaleString("pt-BR")}–${match.jobSalary.max.toLocaleString("pt-BR")}`
    : "A combinar"

  const workModelLabel: Record<string, string> = {
    remoto: "Remoto",
    hibrido: "Híbrido",
    presencial: "Presencial",
  }

  return (
    <div className="glass-card-hover p-6 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <ScoreBadge score={match.score} />
            <h3 className="font-semibold text-white text-lg group-hover:text-accent transition-colors">
              {match.jobTitle}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-sm text-surface-800">
            <span className="font-medium text-surface-900">{match.jobCompany}</span>
            <span className="w-1 h-1 rounded-full bg-surface-600" />
            <span>{salaryText}</span>
            <span className="w-1 h-1 rounded-full bg-surface-600" />
            <span>{workModelLabel[match.jobWorkModel] || match.jobWorkModel}</span>
          </div>
          <p className="text-xs text-surface-700 mt-1">{match.jobLocation}</p>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {match.matchedSkills.map((skill) => (
          <SkillTag key={skill} name={skill} variant="matched" />
        ))}
        {match.missingSkills.map((skill) => (
          <SkillTag key={skill} name={skill} variant="missing" />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-border">
        <span className="text-xs text-surface-700">
          {match.matchedCount}/{match.totalRequired} requisitos · {match.jobPlatform}
        </span>
        <div className="flex gap-3">
          <a
            href={match.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-2 px-4"
          >
            Ver vaga
          </a>
          {match.score >= 0.5 && (
            <button className="btn-primary text-sm py-2 px-4">
              Candidatar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
