"use client"

import { useApplications } from "@/hooks/useApplications"
import { ApplicationStatusCard } from "@/components/ApplicationStatus"

export default function ApplicationsPage() {
  const { applications, loading } = useApplications()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const processing = applications.filter((a) => a.status === "processing")
  const pending = applications.filter((a) => a.status === "pending")
  const completed = applications.filter((a) => a.status === "completed")
  const failed = applications.filter((a) => a.status === "failed")

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Candidaturas<span className="text-accent">.</span>
          </h1>
          <p className="text-surface-800">
            {completed.length} enviadas · {pending.length + processing.length} em andamento · {failed.length} com falha
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-surface-800 text-lg">Nenhuma candidatura ainda.</p>
            <p className="text-surface-700 text-sm mt-2">
              Encontre vagas compatíveis e clique em Candidatar.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {processing.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-surface-700 uppercase tracking-wider mb-4">
                  Processando
                </h2>
                <div className="space-y-3">
                  {processing.map((app) => (
                    <ApplicationStatusCard key={app.id} application={app} />
                  ))}
                </div>
              </section>
            )}

            {pending.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-surface-700 uppercase tracking-wider mb-4">
                  Na fila
                </h2>
                <div className="space-y-3">
                  {pending.map((app) => (
                    <ApplicationStatusCard key={app.id} application={app} />
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-surface-700 uppercase tracking-wider mb-4">
                  Enviadas
                </h2>
                <div className="space-y-3">
                  {completed.map((app) => (
                    <ApplicationStatusCard key={app.id} application={app} />
                  ))}
                </div>
              </section>
            )}

            {failed.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-surface-700 uppercase tracking-wider mb-4">
                  Com falha
                </h2>
                <div className="space-y-3">
                  {failed.map((app) => (
                    <ApplicationStatusCard key={app.id} application={app} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
