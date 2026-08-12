/**
 * Card de match — exibe uma vaga com score e skills comparadas.
 */

import { MockMatch } from "@/mocks/matches"
import { SkillTag } from "./SkillTag"
import { ScoreBadge } from "./ScoreBadge"

interface MatchCardProps {
  match: MockMatch
}

export function MatchCard({ match }: MatchCardProps) {
  const salaryText = match.jobSalary
    ? `R$ ${match.jobSalary.min.toLocaleString("pt-BR")}–${match.jobSalary.max.toLocaleString("pt-BR")}`
    : "Salário não informado"

  const workModelLabel: Record<string, string> = {
    remoto: "Remoto",
    hibrido: "Híbrido",
    presencial: "Presencial",
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <ScoreBadge score={match.score} />
            <h3 className="font-semibold text-gray-900">{match.jobTitle}</h3>
          </div>
          <p className="text-sm text-gray-600">
            {match.jobCompany} · {salaryText} · {workModelLabel[match.jobWorkModel] || match.jobWorkModel}
          </p>
          <p className="text-xs text-gray-400 mt-1">{match.jobLocation}</p>
        </div>
      </div>

      {/* Skills comparison */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {match.matchedSkills.map((skill) => (
          <SkillTag key={skill} name={skill} variant="matched" />
        ))}
        {match.missingSkills.map((skill) => (
          <SkillTag key={skill} name={skill} variant="missing" />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {match.matchedCount}/{match.totalRequired} requisitos · {match.jobPlatform}
        </span>
        <div className="flex gap-2">
          <a
            href={match.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300"
          >
            Ver vaga
          </a>
          {match.score >= 0.5 && (
            <button className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg font-medium">
              Candidatar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
