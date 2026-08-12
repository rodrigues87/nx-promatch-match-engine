# Spec — Serviço 2: Match Engine

## Resumo

Serviço principal da plataforma. Responsável pelo cadastro de candidatos, upload e parsing de CVs, cálculo de compatibilidade (match) entre qualificações do usuário e requisitos das vagas, e entrega de uma interface web moderna para o candidato visualizar e agir sobre seus matches.

---

## Responsabilidades

1. Cadastro e autenticação de usuários (candidatos)
2. Upload de currículo (PDF/DOCX) e extração de qualificações
3. Gerenciamento manual de skills do usuário
4. Escuta de eventos Pub/Sub (new-job, expired-job) do Serviço 1
5. Cálculo de match: skills do usuário × requisitos da vaga
6. Exibição de ranking de vagas compatíveis (frontend)
7. Envio de solicitação de candidatura para fila do Serviço 3
8. Exibição de status das candidaturas em andamento
9. Modo mock: dados simulados para desenvolvimento e testes de UX

---

## Stack Técnica

| Componente | Tecnologia |
|-----------|-----------|
| Linguagem Backend | TypeScript |
| Backend | Cloud Functions for Firebase (2nd gen) |
| Frontend | Next.js 14+ (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| Hospedagem Frontend | Firebase Hosting |
| Banco | Firestore |
| Autenticação | Firebase Authentication (Google, Email/Senha) |
| Storage | Firebase Storage (CVs) |
| Fila de entrada | Pub/Sub (subscriber dos topics do Serviço 1) |
| Fila de saída | Firestore (/queue) para Serviço 3 |
| CI/CD | GitHub Actions → firebase deploy |

---

## Fluxos

### Fluxo 1: Cadastro + Upload CV

```
Usuário acessa o app
      │
      ▼
Firebase Auth (login Google ou email/senha)
      │
      ▼
Primeira vez? → Tela de onboarding:
      │
      ├── 1. Dados básicos (nome, telefone, localização)
      ├── 2. Preferências (salário mínimo, modelo de trabalho)
      ├── 3. Upload de currículo (PDF/DOCX)
      │        │
      │        ▼
      │   Cloud Function: parseResume
      │        │
      │        ├── Salva arquivo no Storage
      │        ├── Extrai texto (pdf-parse ou microservice Python)
      │        ├── Identifica skills
      │        └── Retorna lista de skills extraídas
      │
      ├── 4. Usuário confirma/edita skills
      └── 5. Salva perfil em /users

      ▼
Trigger: onUserCreated / onSkillsUpdated
      │
      ▼
Calcula matches para esse usuário (todas vagas ativas)
      │
      ▼
Salva em /matches
```

### Fluxo 2: Nova vaga (Pub/Sub)

```
Pub/Sub [new-job] → Cloud Function: onNewJob
      │
      ▼
1. Salva/atualiza vaga em /jobs (se não existir)
2. Busca todos os usuários ativos
3. Para cada usuário:
   ├── Calcula match (skills × requirements)
   ├── Score >= 40%? → Salva em /matches
   └── Score < 40%? → Ignora
```

### Fluxo 3: Vaga expirada (Pub/Sub)

```
Pub/Sub [expired-job] → Cloud Function: onExpiredJob
      │
      ▼
1. Marca vaga como inativa em /jobs
2. Query: todos /matches onde jobId == X
3. Deleta todos esses matches
```

### Fluxo 4: Candidatura

```
Usuário clica "Candidatar" em uma vaga
      │
      ▼
Cloud Function: requestApplication
      │
      ├── Verifica se já candidatou (dedup)
      ├── Cria documento em /queue (status: pending)
      └── Retorna posição na fila

      ▼
Frontend mostra: "Na fila (posição 3)"
      │
      ▼
Firestore listener → atualização realtime do status
```

### Fluxo 5: Atualização de skills

```
Usuário edita skills no perfil
      │
      ▼
Cloud Function: onSkillsUpdated
      │
      ▼
Recalcula matches APENAS desse usuário × todas vagas ativas
      │
      ▼
Atualiza /matches (cria novos, remove os que caíram abaixo de 40%)
```

---

## API Endpoints (Cloud Functions)

### Autenticação
Todos os endpoints requerem Firebase Auth token no header:
```
Authorization: Bearer <firebase_id_token>
```

### Usuário

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/users/profile` | Cria/atualiza perfil do usuário |
| GET | `/api/users/profile` | Retorna perfil do usuário logado |
| PUT | `/api/users/skills` | Atualiza lista de skills |
| POST | `/api/users/resume` | Upload de currículo (multipart) |

### Matches

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/matches` | Lista matches do usuário (paginado, ordenado por score) |
| GET | `/api/matches/:id` | Detalhe de um match (skills que atende, que faltam) |
| GET | `/api/matches/stats` | Estatísticas (total, média score, top skills faltantes) |

### Candidaturas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/applications/:jobId` | Solicita candidatura (enfileira) |
| GET | `/api/applications` | Lista candidaturas do usuário (com status) |
| DELETE | `/api/applications/:id` | Cancela candidatura pendente |

### Vagas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/jobs/:id` | Detalhes de uma vaga |
| GET | `/api/jobs/search` | Busca vagas por texto (sem match) |

---

## Cálculo de Match

### Algoritmo (keyword simples)

```typescript
function calculateMatch(user: User, job: Job): MatchResult {
  const userSkills = user.skills.map(s => normalize(s))
  const jobRequirements = job.requirements.map(r => normalize(r))

  if (jobRequirements.length === 0) {
    return { score: 0, matchedSkills: [], missingSkills: [] }
  }

  // Match direto + sinônimos
  const matched: string[] = []
  const missing: string[] = []

  for (const req of jobRequirements) {
    const found = userSkills.some(skill =>
      skill === req ||
      SYNONYMS[skill]?.includes(req) ||
      SYNONYMS[req]?.includes(skill)
    )
    if (found) {
      matched.push(req)
    } else {
      missing.push(req)
    }
  }

  // Score base: % requisitos atendidos (peso 70%)
  const skillScore = matched.length / jobRequirements.length

  // Bonus: critérios adicionais (peso 30%)
  let bonusScore = 0
  let bonusCriteria = 0

  // Salário compatível
  if (job.salary?.max) {
    bonusCriteria++
    if (user.salaryMin <= job.salary.max) bonusScore++
  }

  // Localização/modelo compatível
  if (job.workModel) {
    bonusCriteria++
    if (job.workModel === "remoto" || user.workModels.includes(job.workModel)) {
      bonusScore++
    }
  }

  const criteriaScore = bonusCriteria > 0 ? bonusScore / bonusCriteria : 0.5

  // Score final
  const score = Math.min(1.0, (skillScore * 0.7) + (criteriaScore * 0.3))

  return {
    score: Math.round(score * 100) / 100,
    matchedSkills: matched,
    missingSkills: missing,
    matchedCount: matched.length,
    totalRequired: jobRequirements.length,
    salaryMatch: job.salary?.max ? user.salaryMin <= job.salary.max : null,
    locationMatch: job.workModel === "remoto" || user.workModels.includes(job.workModel ?? "")
  }
}
```

### Normalização de Skills

```typescript
function normalize(skill: string): string {
  return skill.toLowerCase().trim()
    .replace(/\.js$/i, "")   // "React.js" → "react"
    .replace(/\s+/g, " ")
}

const SYNONYMS: Record<string, string[]> = {
  "java": ["jdk", "jvm"],
  "spring boot": ["spring", "spring framework", "spring mvc"],
  "javascript": ["js", "ecmascript"],
  "typescript": ["ts"],
  "react": ["reactjs", "react.js"],
  "node": ["nodejs", "node.js"],
  "postgresql": ["postgres", "pg"],
  "kubernetes": ["k8s"],
  "docker": ["containers", "containerização"],
  "aws": ["amazon web services"],
  "gcp": ["google cloud"],
  "ci/cd": ["cicd", "continuous integration", "continuous delivery"],
  "sql": ["mysql", "postgresql", "sql server"],
  "nosql": ["mongodb", "dynamodb", "firestore"],
  "go": ["golang"],
  "angular": ["angularjs"],
}
```

---

## Frontend — Telas

### Tela 1: Login
- Login com Google (1 clique)
- Login com email/senha
- Design limpo, moderno

### Tela 2: Onboarding (primeira vez)
- Step 1: Nome, telefone, localização
- Step 2: Salário desejado, modelo de trabalho preferido
- Step 3: Upload CV → extração automática de skills
- Step 4: Confirmação/edição de skills (tags editáveis)

### Tela 3: Dashboard (tela principal)
```
┌──────────────────────────────────────────────────────────┐
│  🏠 Dashboard                              [Perfil] [⚙]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Suas top skills: Java · Spring Boot · SQL · Docker      │
│  [Editar skills]                                         │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  📊 Resumo: 24 vagas compatíveis · Média: 72% match     │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  🟢 92% │ Desenvolvedor Java — Nubank                    │
│         │ R$ 8.000–12.000 · Remoto                       │
│         │ ✓Java ✓Spring ✓SQL ✗Kafka ✗AWS                │
│         │                        [Ver detalhes] [Aplicar]│
│                                                          │
│  🟢 85% │ Backend Engineer — iFood                       │
│         │ R$ 10.000–15.000 · Híbrido · São Paulo         │
│         │ ✓Java ✓Docker ✓SQL ✗Go ✗Kubernetes            │
│         │                        [Ver detalhes] [Aplicar]│
│                                                          │
│  🟡 68% │ Full Stack Developer — PagBank                 │
│         │ R$ 7.000–10.000 · Remoto                       │
│         │ ✓Java ✓SQL ✗React ✗TypeScript ✗AWS            │
│         │                        [Ver detalhes] [Aplicar]│
│                                                          │
│  🔴 42% │ DevOps Engineer — Mercado Livre                │
│         │ R$ 12.000–18.000 · Remoto                      │
│         │ ✓Docker ✗Terraform ✗Ansible ✗AWS ✗K8s         │
│         │                        [Ver detalhes]          │
│                                                          │
│  [Carregar mais...]                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Tela 4: Detalhe da Vaga
- Descrição completa
- Requisitos (com ✓/✗ para cada)
- Empresa, salário, localização
- Botão "Candidatar" (se score >= 50%)
- Link para vaga original

### Tela 5: Minhas Candidaturas
```
┌──────────────────────────────────────────────────────────┐
│  📋 Candidaturas                                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🔄 Processando agora                                   │
│     Java Developer — Nubank · Iniciado há 2 min         │
│                                                          │
│  ⏳ Na fila (posição 1)                                  │
│     Backend — iFood · Solicitado há 10 min  [Cancelar]  │
│                                                          │
│  ✅ Enviada                                              │
│     Full Stack — PagBank · Completada há 1h             │
│                                                          │
│  ❌ Falhou (pergunta não respondida)                     │
│     Go Developer — Stone · Há 3h    [Tentar novamente]  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Tela 6: Perfil / Configurações
- Editar dados pessoais
- Upload de novo CV
- Editar skills (adicionar/remover tags)
- Preferências (salário, modelo, localização)

---

## Modo Mock

Para desenvolvimento e testes de UX sem depender dos Serviços 1 e 3.

### Ativação

```typescript
// next.config.ts
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true"
```

### Dados mockados

```typescript
// src/mocks/jobs.ts — Vagas fictícias
// src/mocks/users.ts — Usuário teste
// src/mocks/matches.ts — Matches pré-calculados
// src/mocks/applications.ts — Candidaturas em diversos status
```

### Comportamento no mock

| Ação | Comportamento real | Comportamento mock |
|------|-------------------|-------------------|
| Login | Firebase Auth | Auto-login com user fake |
| Listar matches | Query Firestore | Retorna mock local |
| Candidatar | Cria doc em /queue | Simula timer 5s → "completed" |
| Upload CV | Storage + parse | Retorna skills fixas após 2s |
| Atualizar skills | Recalcula matches | Filtra matches mockados |

---

## Estrutura do Projeto

```
match-engine/
├── functions/
│   ├── src/
│   │   ├── index.ts              # Entry point Cloud Functions
│   │   ├── api/
│   │   │   ├── users.ts          # Endpoints de usuário
│   │   │   ├── matches.ts        # Endpoints de match
│   │   │   ├── applications.ts   # Endpoints de candidatura
│   │   │   └── jobs.ts           # Endpoints de vagas
│   │   ├── triggers/
│   │   │   ├── onNewJob.ts       # Pub/Sub subscriber: nova vaga
│   │   │   ├── onExpiredJob.ts   # Pub/Sub subscriber: vaga expirada
│   │   │   └── onSkillsUpdate.ts # Firestore trigger: user muda skills
│   │   ├── services/
│   │   │   ├── matchCalculator.ts  # Lógica de cálculo de match
│   │   │   ├── resumeParser.ts     # Extração de skills do CV
│   │   │   └── skillNormalizer.ts  # Normalização e sinônimos
│   │   └── utils/
│   │       ├── firestore.ts      # Helpers Firestore
│   │       └── validators.ts     # Validação de input
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── page.tsx          # Landing / redirect
│   │   │   ├── login/
│   │   │   ├── onboarding/
│   │   │   ├── dashboard/
│   │   │   ├── jobs/[id]/
│   │   │   ├── applications/
│   │   │   └── profile/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn components
│   │   │   ├── MatchCard.tsx
│   │   │   ├── SkillTag.tsx
│   │   │   ├── ScoreBadge.tsx
│   │   │   ├── ApplicationStatus.tsx
│   │   │   └── ResumeUpload.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useMatches.ts
│   │   │   ├── useApplications.ts
│   │   │   └── useMock.ts       # Hook para modo mock
│   │   ├── lib/
│   │   │   ├── firebase.ts      # Config Firebase client
│   │   │   ├── api.ts           # API client
│   │   │   └── types.ts         # TypeScript types
│   │   ├── mocks/
│   │   │   ├── jobs.ts          # Vagas mockadas
│   │   │   ├── users.ts         # Usuário mockado
│   │   │   ├── matches.ts       # Matches mockados
│   │   │   └── applications.ts  # Candidaturas mockadas
│   │   └── styles/
│   │       └── globals.css       # Tailwind
│   ├── public/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

---

## Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "score", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "queue",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "queue",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Segurança (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: só o próprio usuário lê/escreve
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Matches: só leitura pelo próprio usuário
    match /matches/{matchId} {
      allow read: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow write: if false; // Só Cloud Functions escrevem
    }
    
    // Jobs: leitura pública (autenticado), escrita só via Functions
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // Queue: usuário cria e lê os próprios, só Functions atualizam
    match /queue/{queueId} {
      allow read: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

---

## Deploy (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy Match Engine

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install & Build Functions
        working-directory: functions
        run: |
          npm ci
          npm run build

      - name: Install & Build Web
        working-directory: web
        run: |
          npm ci
          npm run build

      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.SA_EMAIL }}

      - uses: w9jds/firebase-action@v13
        with:
          args: deploy --only functions,hosting
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SA_KEY }}
```

---

## Parsing de Currículo

### Opção A: pdf-parse (TypeScript nativo)
- Leve, roda direto na Cloud Function
- Extração básica de texto
- Limitado para PDFs complexos

### Opção B: Microservice Python (Cloud Run)
- pdfplumber + regex para extração avançada
- Chamado via HTTP pela Cloud Function
- Melhor qualidade de extração

### Decisão: Começar com Opção A, migrar para B se necessário.

```typescript
// Extração simplificada de skills do texto do CV
function extractSkillsFromText(text: string): string[] {
  const KNOWN_SKILLS = [
    "Java", "Spring Boot", "Python", "JavaScript", "TypeScript",
    "React", "Angular", "Vue", "Node.js", "Go", "Rust",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "SQL", "PostgreSQL", "MongoDB", "Redis",
    "Git", "CI/CD", "Kafka", "RabbitMQ",
    "Flutter", "Swift", "Kotlin",
    // ... expandir
  ]

  const found: string[] = []
  const textLower = text.toLowerCase()

  for (const skill of KNOWN_SKILLS) {
    if (textLower.includes(skill.toLowerCase())) {
      found.push(skill)
    }
  }

  return [...new Set(found)]
}
```

---

## Testes

| Tipo | O que testa |
|------|------------|
| Unit | Cálculo de match (vários cenários de skills) |
| Unit | Normalização de skills + sinônimos |
| Unit | Extração de skills do texto |
| Integration | Cloud Functions com emulador Firebase |
| E2E | Frontend com Cypress/Playwright (usando mock) |

---

## Limitações Conhecidas

1. Match por keyword não entende contexto ("3 anos de Java" vs "conhece Java")
2. Extração de skills do CV pode falhar em layouts complexos
3. Sinônimos precisam ser mantidos manualmente
4. Free tier do Firestore pode limitar recálculo se houver muitos usuários
