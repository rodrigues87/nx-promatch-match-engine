/**
 * Usuário mockado para desenvolvimento.
 */

export interface MockUser {
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
}

export const mockUser: MockUser = {
  id: "mock_user_001",
  name: "Davi Rodrigues",
  email: "davi@example.com",
  phone: "5527997867470",
  location: "Vila Velha, ES",
  salaryMin: 8000,
  workModels: ["remoto", "hibrido"],
  skills: [
    "Java",
    "Spring Boot",
    "SQL",
    "Docker",
    "Git",
    "Go",
    "Angular",
    "TypeScript",
    "PostgreSQL",
    "REST",
  ],
  experienceYears: 3,
  resumePath: "cvs/mock_user_001/resume.pdf",
  createdAt: "2026-07-15T10:00:00Z",
}
