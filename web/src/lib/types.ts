/**
 * Tipos compartilhados entre frontend e backend.
 */

export interface User {
  id: string
  name: string
  email: string
  phone: string
  location: string
  salaryMin: number
  workModels: string[]
  skills: string[]
  experienceYears: number
  resumePath: string
  createdAt: string
  updatedAt?: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: { min: number; max: number; currency: string } | null
  requirements: string[]
  responsibilities: string[]
  workModel: "remoto" | "hibrido" | "presencial"
  experienceLevel: string
  platform: "linkedin" | "indeed" | "glassdoor"
  url: string
  postedAt: string
}

export interface Match {
  id: string
  userId: string
  jobId: string
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  matchedCount: number
  totalRequired: number
  salaryMatch: boolean
  locationMatch: boolean
  calculatedAt: string
  // Dados desnormalizados
  jobTitle: string
  jobCompany: string
  jobLocation: string
  jobSalary: { min: number; max: number; currency: string } | null
  jobWorkModel: string
  jobPlatform: string
  jobUrl: string
}

export type ApplicationStatus = "pending" | "processing" | "completed" | "failed" | "cancelled"

export interface Application {
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
  result: { success: boolean; message: string } | null
  lastError: string | null
  queuePosition: number | null
}
