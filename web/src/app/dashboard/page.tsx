"use client"

import { useMatches } from "@/hooks/useMatches"
import { useProfile } from "@/hooks/useProfile"
import { MatchCard } from "@/components/MatchCard"
import { SkillTag } from "@/components/SkillTag"
import Link from "next/link"

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile()
  const { matches, loading: matchesLoading } = useMatches()

  const loading = profileLoading || matchesLoading

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

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
            {(profile?.skills || []).map((skill) => (
              <SkillTag key={skill} name={skill} variant="user" />
            ))}
            {(!profile?.skills || profile.skills.length === 0) && (
              <Link href="/onboarding" className="text-sm text-blue-600 hover:underline">
                Adicionar qualificações
              </Link>
            )}
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
          {matches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">Nenhuma vaga compatível encontrada ainda.</p>
              <p className="text-sm text-gray-400 mt-1">Adicione suas skills para ver matches.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
