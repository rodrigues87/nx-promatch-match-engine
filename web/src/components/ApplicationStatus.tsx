/**
 * Card de status de candidatura.
 */

import { MockApplication } from "@/mocks/applications"

interface ApplicationStatusCardProps {
  application: MockApplication
}

const statusConfig: Record<string, { icon: string; color: string; label: string }> = {
  processing: { icon: "🔄", color: "border-blue-300 bg-blue-50", label: "Processando" },
  pending: { icon: "⏳", color: "border-yellow-300 bg-yellow-50", label: "Na fila" },
  completed: { icon: "✅", color: "border-green-300 bg-green-50", label: "Enviada" },
  failed: { icon: "❌", color: "border-red-300 bg-red-50", label: "Falhou" },
  cancelled: { icon: "🚫", color: "border-gray-300 bg-gray-50", label: "Cancelada" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  return `há ${Math.floor(hours / 24)}d`
}

export function ApplicationStatusCard({ application }: ApplicationStatusCardProps) {
  const config = statusConfig[application.status] || statusConfig.pending

  return (
    <div className={`rounded-xl border p-4 ${config.color}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-xl">{config.icon}</span>
          <div>
            <p className="font-medium text-gray-900">
              {application.jobTitle}
            </p>
            <p className="text-sm text-gray-600">
              {application.jobCompany} · {Math.round(application.matchScore * 100)}% match
            </p>

            {/* Status-specific info */}
            {application.status === "pending" && application.queuePosition && (
              <p className="text-xs text-yellow-700 mt-1">
                Posição {application.queuePosition} na fila · Solicitado {timeAgo(application.createdAt)}
              </p>
            )}
            {application.status === "processing" && application.startedAt && (
              <p className="text-xs text-blue-700 mt-1">
                Iniciado {timeAgo(application.startedAt)}
              </p>
            )}
            {application.status === "completed" && application.completedAt && (
              <p className="text-xs text-green-700 mt-1">
                Completada {timeAgo(application.completedAt)}
              </p>
            )}
            {application.status === "failed" && (
              <p className="text-xs text-red-600 mt-1">
                {application.result?.message || application.lastError}
                {" · "}Tentativas: {application.attempts}/{application.maxAttempts}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div>
          {application.status === "pending" && (
            <button className="text-xs text-red-600 hover:text-red-800 font-medium">
              Cancelar
            </button>
          )}
          {application.status === "failed" && application.attempts < application.maxAttempts && (
            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
