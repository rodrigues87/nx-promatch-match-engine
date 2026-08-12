/**
 * Matches pré-calculados mockados.
 * Simula o resultado do cálculo: user.skills × job.requirements
 */

import { mockJobs } from "./jobs"
import { mockUser } from "./users"

export interface MockMatch {
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
  // Dados desnormalizados para facilitar exibição
  jobTitle: string
  jobCompany: string
  jobLocation: string
  jobSalary: { min: number; max: number; currency: string } | null
  jobWorkModel: string
  jobPlatform: string
  jobUrl: string
}

/**
 * Calcula match simulado entre o usuário mock e as vagas mock.
 */
function calculateMockMatch(
  userSkills: string[],
  jobRequirements: string[],
): { matched: string[]; missing: string[] } {
  const userNorm = userSkills.map((s) => s.toLowerCase())

  const matched: string[] = []
  const missing: string[] = []

  for (const req of jobRequirements) {
    const reqNorm = req.toLowerCase()
    const found = userNorm.some(
      (skill) => skill === reqNorm || skill.includes(reqNorm) || reqNorm.includes(skill),
    )
    if (found) {
      matched.push(req)
    } else {
      missing.push(req)
    }
  }

  return { matched, missing }
}

function generateMockMatches(): MockMatch[] {
  const matches: MockMatch[] = []

  for (const job of mockJobs) {
    const { matched, missing } = calculateMockMatch(mockUser.skills, job.requirements)
    const totalRequired = job.requirements.length

    // Score base (70% skills + 30% critérios)
    const skillScore = totalRequired > 0 ? matched.length / totalRequired : 0

    let bonusScore = 0
    let bonusCriteria = 0

    // Salário
    if (job.salary) {
      bonusCriteria++
      if (mockUser.salaryMin <= job.salary.max) bonusScore++
    }

    // Modelo de trabalho
    bonusCriteria++
    if (job.workModel === "remoto" || mockUser.workModels.includes(job.workModel)) {
      bonusScore++
    }

    const criteriaScore = bonusCriteria > 0 ? bonusScore / bonusCriteria : 0.5
    const score = Math.min(1.0, skillScore * 0.7 + criteriaScore * 0.3)

    // Só inclui se >= 40%
    if (score >= 0.4) {
      matches.push({
        id: `match_${job.id}`,
        userId: mockUser.id,
        jobId: job.id,
        score: Math.round(score * 100) / 100,
        matchedSkills: matched,
        missingSkills: missing,
        matchedCount: matched.length,
        totalRequired,
        salaryMatch: job.salary ? mockUser.salaryMin <= job.salary.max : true,
        locationMatch: job.workModel === "remoto" || mockUser.workModels.includes(job.workModel),
        calculatedAt: new Date().toISOString(),
        // Desnormalizados
        jobTitle: job.title,
        jobCompany: job.company,
        jobLocation: job.location,
        jobSalary: job.salary,
        jobWorkModel: job.workModel,
        jobPlatform: job.platform,
        jobUrl: job.url,
      })
    }
  }

  // Ordena por score decrescente
  return matches.sort((a, b) => b.score - a.score)
}

export const mockMatches: MockMatch[] = generateMockMatches()
