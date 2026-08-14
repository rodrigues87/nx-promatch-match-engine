import { MockApplication } from "@/mocks/applications"

interface ApplicationStatusCardProps {
  application: MockApplication
}

const statusConfig: Record<string, { icon: string; color: string; label: string; glow: string }> = {
  processing: { icon: "⚡", color: "border-accent/30 bg-accent-glow", label: "Processando", glow: "shadow-glow" },
  pending: { icon: "⏳", color: "border-surface-500/30 bg-surface-200", label: "Na fila", glow: "" },
  completed: { icon: "✓", color: "border-green-400/30 bg-green-400/10", label: "Enviada", glow: "" },
  failed: { icon: "✗", color: "border-red-400/30 bg-red-400/10", label: "Falhou", glow: "" },
  cancelled: { icon: "—", color: "border-dark-border bg-surface-100", label: "Cancelada", glow: "" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export function ApplicationStatusCard({ application }: ApplicationStatusCardProps) {
  const config = statusConfig[application.status] || statusConfig.pending

  return (
    <div className={`rounded-xl border p-5 ${config.color} ${config.glow} transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Status icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
            application.status === "completed" ? "bg-green-400/20 text-green-400" :
            application.status === "processing" ? "bg-accent/20 text-accent" :
            application.status === "failed" ? "bg-red-400/20 text-red-400" :
            "bg-surface-300 text-surface-800"
          }`}>
            {config.icon}
          </div>

          <div>
            <p className="font-semibold text-white">
              {application.jobTitle}
            </p>
            <p className="text-sm text-surface-800 mt-0.5">
              {application.jobCompany} · {Math.round(application.matchScore * 100)}% match
            </p>

            {/* Status-specific info */}
            {application.status === "pending" && application.queuePosition && (
              <p className="text-xs text-surface-700 mt-2">
                Posição {application.queuePosition} · {timeAgo(application.createdAt)} atrás
              </p>
            )}
            {application.status === "processing" && application.startedAt && (
              <p className="text-xs text-accent mt-2">
                Iniciado há {timeAgo(application.startedAt)}
              </p>
            )}
            {application.status === "completed" && application.completedAt && (
              <p className="text-xs text-green-400 mt-2">
                Completada há {timeAgo(application.completedAt)}
              </p>
            )}
            {application.status === "failed" && (
              <p className="text-xs text-red-400 mt-2">
                {application.result?.message || application.lastError}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div>
          {application.status === "pending" && (
            <button className="text-xs text-surface-700 hover:text-red-400 font-medium transition-colors">
              Cancelar
            </button>
          )}
          {application.status === "failed" && application.attempts < application.maxAttempts && (
            <button className="text-xs text-accent hover:text-accent-light font-medium transition-colors">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
