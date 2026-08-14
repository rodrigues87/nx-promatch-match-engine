/**
 * Dashboard — Tela principal com ranking de vagas compatíveis.
 * Usa dados mockados para prototipação de UX.
 */

import { mockMatches } from "@/mocks/matches"
import { mockUser } from "@/mocks/users"
import { MatchCard } from "@/components/MatchCard"
import { SkillTag } from "@/components/SkillTag"
import Link from "next/link"

export default function DashboardPage() {
  const user = mockUser
  const matches = mockMatches

  const avgScore = matches.length > 0
    ? Math.round((matches.reduce((sum, m) => sum + m.score, 0) / matches.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Skills do usuário */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Suas skills
            </h2>
            <Link href="/profile" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Editar
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <SkillTag key={skill} name={skill} variant="user" />
            ))}
          </div>
        </section>

        {/* Resumo */}
        <section className="mb-8 bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
              <p className="text-sm text-gray-500">Vagas compatíveis</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{avgScore}%</p>
              <p className="text-sm text-gray-500">Match médio</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {matches.filter((m) => m.score >= 0.8).length}
              </p>
              <p className="text-sm text-gray-500">Match alto (80%+)</p>
            </div>
          </div>
        </section>

        {/* Lista de matches */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Vagas para você
          </h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
