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
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const avgScore = matches.length > 0
    ? Math.round((matches.reduce((sum, m) => sum + m.score, 0) / matches.length) * 100)
    : 0

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Background glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Hero section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Suas vagas<span className="text-accent">.</span>
          </h1>
          <p className="text-surface-800">
            Vagas compatíveis com seu perfil, ordenadas por aderência
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-white">{matches.length}</p>
            <p className="text-sm text-surface-700 mt-1">Vagas compatíveis</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-accent">{avgScore}%</p>
            <p className="text-sm text-surface-700 mt-1">Match médio</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-3xl font-bold text-green-400">
              {matches.filter((m) => m.score >= 0.8).length}
            </p>
            <p className="text-sm text-surface-700 mt-1">Match alto (80%+)</p>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-surface-700 uppercase tracking-wider">
              Skills
            </h2>
            <Link href="/profile" className="text-sm text-accent hover:text-accent-light font-medium transition-colors">
              Editar
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile?.skills || []).map((skill) => (
              <SkillTag key={skill} name={skill} variant="user" />
            ))}
            {(!profile?.skills || profile.skills.length === 0) && (
              <Link href="/onboarding" className="text-sm text-accent hover:underline">
                + Adicionar qualificações
              </Link>
            )}
          </div>
        </div>

        {/* Matches list */}
        <div>
          <h2 className="text-sm font-medium text-surface-700 uppercase tracking-wider mb-4">
            Ranking de vagas
          </h2>
          {matches.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-surface-800 text-lg">Nenhuma vaga compatível ainda.</p>
              <p className="text-surface-700 text-sm mt-2">Adicione suas skills para ver matches.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
