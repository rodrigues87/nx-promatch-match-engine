/**
 * Página de candidaturas — mostra status de todas as aplicações.
 */

import { mockApplications } from "@/mocks/applications"
import { ApplicationStatusCard } from "@/components/ApplicationStatus"

export default function ApplicationsPage() {
  const applications = mockApplications

  const processing = applications.filter((a) => a.status === "processing")
  const pending = applications.filter((a) => a.status === "pending")
  const completed = applications.filter((a) => a.status === "completed")
  const failed = applications.filter((a) => a.status === "failed")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Minhas Candidaturas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {completed.length} enviadas · {pending.length + processing.length} em andamento · {failed.length} com falha
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
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
      </main>
    </div>
  )
}
