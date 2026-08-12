# Arquitetura Geral — Plataforma de Vagas Inteligente

## Visão Geral

Plataforma composta por 3 serviços independentes que, juntos, automatizam o ciclo completo de busca e candidatura a vagas de emprego:

1. **Job Tracker** — Rastreia vagas em sites de emprego
2. **Match Engine** — Cadastra candidatos e calcula compatibilidade com vagas
3. **Auto Apply** — Submete candidaturas automaticamente via browser

---

## Diagrama de Arquitetura

```
┌─── FIREBASE + GOOGLE CLOUD (mesmo projeto) ──────────────────────────────────┐
│                                                                              │
│  ┌─────────────────────────────┐        ┌──────────────────────────────────┐ │
│  │  SERVIÇO 1: Job Tracker     │        │  SERVIÇO 2: Match Engine         │ │
│  │  (Cloud Run + Scheduler)    │        │  (Cloud Functions + Hosting)     │ │
│  │                             │        │                                  │ │
│  │  • Scraping diário (03:00)  │        │  • API REST (TypeScript)         │ │
│  │  • LinkedIn, Indeed, etc.   │        │  • Frontend Next.js              │ │
│  │  • Detecta novas/expiradas  │        │  • Cadastro + Upload CV          │ │
│  │  • Publica em Pub/Sub       │        │  • Calcula match (keywords)      │ │
│  │                             │        │  • Escuta Pub/Sub                │ │
│  └──────────┬──────────────────┘        └──────────┬───────────────────────┘ │
│             │                                      │                         │
│             │  [Pub/Sub: new-job]                   │                         │
│             │  [Pub/Sub: expired-job]               │                         │
│             └──────────────────────────────────────►│                         │
│                                                    │                         │
│                                                    │  [Firestore: /queue]     │
│                                                    │                         │
│  ┌─────────────────────────────────────────────────┼────────────────────────┐│
│  │  SERVIÇO 3: Auto Apply                          │                        ││
│  │  (Compute Engine e2-micro)                      │                        ││
│  │                                                 ▼                        ││
│  │  • Escuta fila /queue (Firestore)                                        ││
│  │  • Processa 1 candidatura por vez                                        ││
│  │  • Playwright headless                                                   ││
│  │  • Respeita limites (25/dia LinkedIn)                                    ││
│  │  • Reporta resultado → Firestore                                         ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─── INFRAESTRUTURA COMPARTILHADA ─────────────────────────────────────────┐│
│  │  Firestore ──── /jobs, /users, /matches, /queue                          ││
│  │  Pub/Sub ────── new-job, expired-job (Serviço 1 → 2)                     ││
│  │  Auth ────────── Firebase Authentication                                  ││
│  │  Storage ─────── Firebase Storage (CVs)                                   ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Tecnologias

| Componente | Tecnologia |
|-----------|-----------|
| Linguagem Serviço 1 | Python |
| Linguagem Serviço 2 | TypeScript |
| Linguagem Serviço 3 | Python |
| Frontend | Next.js (React) |
| Banco de dados | Firestore |
| Autenticação | Firebase Auth |
| Armazenamento | Firebase Storage |
| Filas (1 → 2) | Google Cloud Pub/Sub |
| Fila (2 → 3) | Firestore collection (/queue) |
| Hospedagem Serviço 1 | Cloud Run + Cloud Scheduler |
| Hospedagem Serviço 2 | Cloud Functions + Firebase Hosting |
| Hospedagem Serviço 3 | Compute Engine (e2-micro, grátis) |
| CI/CD | GitHub Actions (3 pipelines) |
| Auth GitHub → GCP | Workload Identity Federation |
| Custo | $0/mês (free tier) |

---

## Fluxo Principal

### 1. Coleta de Vagas (diário, 03:00)

```
Cloud Scheduler → Cloud Run (Serviço 1)
  → Scraping LinkedIn, Indeed, Glassdoor
  → Compara com /jobs existentes no Firestore
  → Vaga nova? → Pub/Sub [new-job] (vaga a vaga)
  → Vaga expirada? → Pub/Sub [expired-job]
  → Atualiza /jobs no Firestore
```

### 2. Cálculo de Match (event-driven)

```
Pub/Sub [new-job] → Cloud Function (Serviço 2)
  → Recebe dados da vaga
  → Para cada usuário ativo:
    → Calcula score (% requisitos atendidos)
    → Se score >= 40%: salva em /matches
    
Pub/Sub [expired-job] → Cloud Function (Serviço 2)
  → Recebe jobId
  → Remove todos os /matches com esse jobId
```

### 3. Experiência do Usuário

```
Usuário abre o app
  → Firebase Auth (login)
  → Query /matches?userId=X&orderBy=score desc
  → Vê ranking de vagas compatíveis (instantâneo)
  → Clica "Candidatar"
  → Cria doc em /queue (status: pending)
```

### 4. Candidatura Automática (sequencial)

```
Worker na VM (Serviço 3)
  → Polling /queue (status == pending, orderBy createdAt)
  → Pega próximo item
  → Playwright: abre browser → preenche → submete
  → Atualiza /queue (status: completed/failed)
  → Delay 30-90s
  → Próximo...
```

---

## Firestore Schema

### /jobs (escritas pelo Serviço 1)
```
{
  id: string,
  title: string,
  company: string,
  location: string,
  salary: { min: number, max: number },
  requirements: string[],
  responsibilities: string[],
  workModel: "remoto" | "hibrido" | "presencial",
  platform: "linkedin" | "indeed" | "glassdoor",
  url: string,
  isActive: boolean,
  scrapedAt: Timestamp,
  expiredAt: Timestamp | null
}
```

### /users (gerenciado pelo Serviço 2)
```
{
  id: string (Firebase Auth UID),
  name: string,
  email: string,
  phone: string,
  location: string,
  salaryMin: number,
  workModels: string[],
  skills: string[],
  experienceYears: number,
  resumePath: string (Storage ref),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### /matches (calculado pelo Serviço 2)
```
{
  id: string,
  userId: string,
  jobId: string,
  score: number (0.0 - 1.0),
  matchedSkills: string[],
  missingSkills: string[],
  matchedCount: number,
  totalRequired: number,
  salaryMatch: boolean,
  locationMatch: boolean,
  calculatedAt: Timestamp
}
```

### /queue (fila Serviço 2 → Serviço 3)
```
{
  id: string,
  userId: string,
  jobId: string,
  platform: string,
  status: "pending" | "processing" | "completed" | "failed" | "cancelled",
  priority: number,
  resumePath: string,
  userSkills: string[],
  matchScore: number,
  createdAt: Timestamp,
  startedAt: Timestamp | null,
  completedAt: Timestamp | null,
  attempts: number,
  maxAttempts: number,
  result: {
    success: boolean,
    message: string,
    screenshotUrl: string | null
  } | null,
  lastError: string | null
}
```

---

## Deploy Automático (CI/CD)

### Repositórios

| Repositório | Pipeline | Deploy target |
|------------|----------|---------------|
| `job-tracker` | GitHub Actions → Docker → Cloud Run | Cloud Run |
| `match-engine` | GitHub Actions → firebase deploy | Functions + Hosting |
| `auto-apply` | GitHub Actions → SSH → git pull + restart | Compute Engine VM |

### Trigger

Todos: push na branch `main`.

### Autenticação

Workload Identity Federation (OIDC, sem chave JSON).

---

## Limites e Controles

| Controle | Valor |
|----------|-------|
| Candidaturas/dia LinkedIn | 25 |
| Score mínimo para match | 40% |
| Retry máximo por candidatura | 3 |
| Delay entre candidaturas | 30-90s (aleatório) |
| Timeout candidatura | 10 min |
| Scraping | 1x/dia (03:00) |
| Recálculo match user on-demand | Quando user atualiza skills |

---

## Custo Estimado (Free Tier)

| Recurso | Limite grátis | Uso estimado |
|---------|--------------|--------------|
| Cloud Functions | 2M invocações/mês | < 50K |
| Firestore reads | 50K/dia | < 10K |
| Firestore writes | 20K/dia | < 5K |
| Firebase Hosting | 10GB + 360MB/dia | < 1GB |
| Pub/Sub | 10GB/mês | < 100MB |
| Cloud Run | 2M req/mês | < 1K |
| Compute Engine | 1x e2-micro always free | 1 VM |
| Storage | 5GB | < 1GB |
| **TOTAL** | — | **$0/mês** |
