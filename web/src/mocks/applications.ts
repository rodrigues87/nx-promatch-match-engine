/**
 * Candidaturas mockadas em diversos estados.
 */

export type ApplicationStatus = "pending" | "processing" | "completed" | "failed" | "cancelled"

export interface MockApplication {
  id: string
  userId: string
  jobId: string
  jobTitle: string
  jobCompany: string
  platform: string
  status: ApplicationStatus
  matchScore: number
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  attempts: number
  maxAttempts: number
  result: {
    success: boolean
    message: string
  } | null
  lastError: string | null
  queuePosition: number | null
}

export const mockApplications: MockApplication[] = [
  {
    id: "app_001",
    userId: "mock_user_001",
    jobId: "linkedin_abc123",
    jobTitle: "Desenvolvedor Java Pleno",
    jobCompany: "Nubank",
    platform: "linkedin",
    status: "processing",
    matchScore: 0.92,
    createdAt: "2026-08-12T14:00:00Z",
    startedAt: "2026-08-12T14:02:00Z",
    completedAt: null,
    attempts: 1,
    maxAttempts: 3,
    result: null,
    lastError: null,
    queuePosition: null,
  },
  {
    id: "app_002",
    userId: "mock_user_001",
    jobId: "linkedin_def456",
    jobTitle: "Backend Engineer",
    jobCompany: "iFood",
    platform: "linkedin",
    status: "pending",
    matchScore: 0.85,
    createdAt: "2026-08-12T14:05:00Z",
    startedAt: null,
    completedAt: null,
    attempts: 0,
    maxAttempts: 3,
    result: null,
    lastError: null,
    queuePosition: 1,
  },
  {
    id: "app_003",
    userId: "mock_user_001",
    jobId: "linkedin_ghi789",
    jobTitle: "Full Stack Developer",
    jobCompany: "PagBank",
    platform: "linkedin",
    status: "completed",
    matchScore: 0.78,
    createdAt: "2026-08-12T10:00:00Z",
    startedAt: "2026-08-12T10:02:00Z",
    completedAt: "2026-08-12T10:04:30Z",
    attempts: 1,
    maxAttempts: 3,
    result: { success: true, message: "Candidatura enviada com sucesso!" },
    lastError: null,
    queuePosition: null,
  },
  {
    id: "app_004",
    userId: "mock_user_001",
    jobId: "indeed_jkl012",
    jobTitle: "Desenvolvedor Go",
    jobCompany: "Mercado Livre",
    platform: "indeed",
    status: "failed",
    matchScore: 0.65,
    createdAt: "2026-08-12T08:00:00Z",
    startedAt: "2026-08-12T08:01:00Z",
    completedAt: "2026-08-12T08:03:00Z",
    attempts: 2,
    maxAttempts: 3,
    result: { success: false, message: "Pergunta não respondida: 'Qual sua experiência com Terraform?'" },
    lastError: "Formulário com campo obrigatório não preenchido",
    queuePosition: null,
  },
  {
    id: "app_005",
    userId: "mock_user_001",
    jobId: "linkedin_pqr678",
    jobTitle: "Desenvolvedor Spring Boot",
    jobCompany: "Itaú",
    platform: "linkedin",
    status: "pending",
    matchScore: 0.88,
    createdAt: "2026-08-12T14:10:00Z",
    startedAt: null,
    completedAt: null,
    attempts: 0,
    maxAttempts: 3,
    result: null,
    lastError: null,
    queuePosition: 2,
  },
]
