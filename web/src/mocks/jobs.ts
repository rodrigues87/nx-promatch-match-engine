/**
 * Vagas mockadas para desenvolvimento e testes de UX.
 */

export interface MockJob {
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

export const mockJobs: MockJob[] = [
  {
    id: "linkedin_abc123",
    title: "Desenvolvedor Java Pleno",
    company: "Nubank",
    location: "Remoto",
    salary: { min: 8000, max: 12000, currency: "BRL" },
    requirements: ["Java", "Spring Boot", "Kafka", "AWS", "SQL", "Microsserviços"],
    responsibilities: [
      "Desenvolver APIs REST escaláveis",
      "Manter pipelines de dados em tempo real",
      "Participar de code reviews",
    ],
    workModel: "remoto",
    experienceLevel: "Pleno",
    platform: "linkedin",
    url: "https://linkedin.com/jobs/view/123456",
    postedAt: "2026-08-10T00:00:00Z",
  },
  {
    id: "linkedin_def456",
    title: "Backend Engineer",
    company: "iFood",
    location: "São Paulo, SP (Híbrido)",
    salary: { min: 10000, max: 15000, currency: "BRL" },
    requirements: ["Java", "Go", "Docker", "Kubernetes", "SQL", "Kafka"],
    responsibilities: [
      "Arquitetar e implementar microsserviços",
      "Otimizar performance de sistemas de alta disponibilidade",
    ],
    workModel: "hibrido",
    experienceLevel: "Pleno/Senior",
    platform: "linkedin",
    url: "https://linkedin.com/jobs/view/234567",
    postedAt: "2026-08-11T00:00:00Z",
  },
  {
    id: "linkedin_ghi789",
    title: "Full Stack Developer",
    company: "PagBank",
    location: "Remoto",
    salary: { min: 7000, max: 10000, currency: "BRL" },
    requirements: ["Java", "Spring Boot", "React", "TypeScript", "SQL", "AWS"],
    responsibilities: [
      "Desenvolver features end-to-end (backend + frontend)",
      "Integrar com serviços de pagamento",
    ],
    workModel: "remoto",
    experienceLevel: "Pleno",
    platform: "linkedin",
    url: "https://linkedin.com/jobs/view/345678",
    postedAt: "2026-08-09T00:00:00Z",
  },
  {
    id: "indeed_jkl012",
    title: "Desenvolvedor Go",
    company: "Mercado Livre",
    location: "Remoto",
    salary: { min: 12000, max: 18000, currency: "BRL" },
    requirements: ["Go", "Kubernetes", "AWS", "Terraform", "Docker", "CI/CD"],
    responsibilities: [
      "Desenvolver plataforma de infraestrutura",
      "Automatizar deploys e provisionamento",
    ],
    workModel: "remoto",
    experienceLevel: "Senior",
    platform: "indeed",
    url: "https://indeed.com.br/jobs/view/456789",
    postedAt: "2026-08-11T00:00:00Z",
  },
  {
    id: "linkedin_mno345",
    title: "Angular Developer",
    company: "Totvs",
    location: "Porto Alegre, RS (Híbrido)",
    salary: { min: 6000, max: 9000, currency: "BRL" },
    requirements: ["Angular", "TypeScript", "RxJS", "HTML", "CSS", "Git"],
    responsibilities: [
      "Desenvolver interfaces para ERP",
      "Manter design system interno",
    ],
    workModel: "hibrido",
    experienceLevel: "Pleno",
    platform: "linkedin",
    url: "https://linkedin.com/jobs/view/567890",
    postedAt: "2026-08-10T00:00:00Z",
  },
  {
    id: "linkedin_pqr678",
    title: "Desenvolvedor Spring Boot",
    company: "Itaú",
    location: "São Paulo, SP",
    salary: { min: 9000, max: 14000, currency: "BRL" },
    requirements: ["Java", "Spring Boot", "Oracle", "SQL", "REST", "Docker"],
    responsibilities: [
      "Manter sistemas bancários de alta criticidade",
      "Implementar integrações com parceiros",
    ],
    workModel: "hibrido",
    experienceLevel: "Pleno/Senior",
    platform: "linkedin",
    url: "https://linkedin.com/jobs/view/678901",
    postedAt: "2026-08-12T00:00:00Z",
  },
  {
    id: "indeed_stu901",
    title: "Software Engineer",
    company: "Cloudwalk",
    location: "Remoto",
    salary: { min: 8000, max: 13000, currency: "BRL" },
    requirements: ["Go", "Ruby", "PostgreSQL", "Docker", "AWS", "GraphQL"],
    responsibilities: [
      "Desenvolver APIs de pagamentos",
      "Projetar soluções escaláveis para fintech",
    ],
    workModel: "remoto",
    experienceLevel: "Pleno",
    platform: "indeed",
    url: "https://indeed.com.br/jobs/view/789012",
    postedAt: "2026-08-08T00:00:00Z",
  },
  {
    id: "linkedin_vwx234",
    title: "DevOps Engineer",
    company: "Stone",
    location: "Remoto",
    salary: { min: 11000, max: 16000, currency: "BRL" },
    requirements: ["Terraform", "Ansible", "AWS", "Kubernetes", "Docker", "Linux", "CI/CD"],
    responsibilities: [
      "Gerenciar infraestrutura cloud",
      "Implementar pipelines de deploy automatizados",
    ],
    workModel: "remoto",
    experienceLevel: "Senior",
    platform: "linkedin",
    url: "https://linkedin.com/jobs/view/890123",
    postedAt: "2026-08-11T00:00:00Z",
  },
]
