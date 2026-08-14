"use client"

import { useApplications } from "@/hooks/useApplications"
import { ApplicationStatusCard } from "@/components/ApplicationStatus"

export default function ApplicationsPage() {
  const { applications, loading } = useApplications()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const processing = applications.filter((a) => a.status === "processing")
  const pending = applications.filter((a) => a.status === "pending")
  const completed = applications.filter((a) => a.status === "completed")
  const failed = applications.filter((a) => a.status === "failed")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Minhas Candidaturas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {completed.length} enviadas · {pending.length + processing.length} em andamento · {failed.length} com falha
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Nenhuma candidatura ainda.</p>
            <p className="text-sm text-gray-400 mt-1">
              Encontre vagas compatíveis no Dashboard e clique em Candidatar.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Processando */}
            {processing.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Processando agora
                </h2>
                <div className="space-y-3">
                  {processing.map((app) => (
                    <ApplicationStatusCard key={app.id} application={app} />
                  ))}
                </div>
              </section>
            )}

            {/* Na fila */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Na fila
                </h2>
                <div className="space-y-3">
                  {pending.map((app) => (
                    <ApplicationStatusCard key={app.id} application={app} />
                  ))}
                </div>
              </section>
            )}

            {/* Enviadas */}
            {completed.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Enviadas com sucesso
                </h2>
                <div className="space-y-3">
                  {completed.map((app) => (
                    <ApplicationStatusCard key={app.id} application={app} />
                  ))}
                </div>
              </section>
            )}

            {/* Falhas */}
            {failed.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
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
