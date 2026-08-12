# Spec — Serviço 1: Job Tracker

## Resumo

Serviço responsável por rastrear vagas de emprego em múltiplas plataformas, extrair qualificações/salário/requisitos, detectar novas vagas e vagas expiradas, e comunicar mudanças ao Serviço 2 via Pub/Sub.

---

## Responsabilidades

1. Scraping diário de vagas em plataformas configuradas
2. Extração estruturada: título, empresa, salário, requisitos, localização, modelo de trabalho
3. Detecção de vagas novas (não existem no Firestore)
4. Detecção de vagas expiradas (existem no Firestore mas não estão mais ativas)
5. Publicação de eventos no Pub/Sub (vaga a vaga)
6. Persistência de vagas no Firestore (/jobs)

---

## Stack Técnica

| Componente | Tecnologia |
|-----------|-----------|
| Linguagem | Python 3.12+ |
| Framework HTTP | FastAPI (health check) |
| Scraping | requests + BeautifulSoup4 / httpx |
| Agendamento | Cloud Scheduler (cron) |
| Hospedagem | Cloud Run |
| Banco | Firestore (coleção /jobs) |
| Fila de saída | Google Cloud Pub/Sub |
| Container | Docker |
| CI/CD | GitHub Actions → Cloud Run |

---

## Fontes de Vagas

| Plataforma | Método | Prioridade |
|-----------|--------|-----------|
| LinkedIn | Endpoint público `/jobs-guest/jobs/api/` | Alta |
| Indeed | Scraping de listagem pública | Alta |
| Glassdoor | Scraping de listagem pública | Média |
| Gupy | API pública de empresas | Baixa (futuro) |
| Vagas.com | Scraping | Baixa (futuro) |

---

## Fluxo de Execução

```
Cloud Scheduler (03:00 diário)
      │
      ▼
Cloud Run (Serviço 1) inicia
      │
      ▼
Para cada plataforma configurada:
      │
      ├── 1. Busca vagas por títulos configurados
      │      (ex: "Java Developer", "Full Stack", "Backend")
      │
      ├── 2. Para cada vaga encontrada:
      │      │
      │      ├── Já existe em /jobs? → Pula (não é nova)
      │      │
      │      └── Não existe? → É NOVA:
      │             ├── Salva em /jobs (isActive: true)
      │             └── Publica em Pub/Sub [new-job]
      │
      ├── 3. Verifica vagas existentes no Firestore:
      │      │
      │      ├── Ainda ativa na plataforma? → OK
      │      │
      │      └── Não encontrada / 404? → EXPIRADA:
      │             ├── Atualiza /jobs (isActive: false, expiredAt: now)
      │             └── Publica em Pub/Sub [expired-job]
      │
      └── 4. Log de resultado
             
      ▼
Cloud Run encerra (scale to zero)
```

---

## Pub/Sub Topics

### Topic: `new-job`

Publicado quando uma vaga nova é detectada.

```json
{
  "jobId": "linkedin_456789",
  "title": "Desenvolvedor Java Pleno",
  "company": "Nubank",
  "location": "Remoto",
  "salary": {
    "min": 8000,
    "max": 12000,
    "currency": "BRL"
  },
  "requirements": [
    "Java",
    "Spring Boot",
    "Kafka",
    "AWS",
    "SQL",
    "Microsserviços"
  ],
  "responsibilities": [
    "Desenvolver APIs REST",
    "Manter pipelines de dados"
  ],
  "workModel": "remoto",
  "experienceLevel": "pleno",
  "platform": "linkedin",
  "url": "https://www.linkedin.com/jobs/view/456789/",
  "postedAt": "2026-08-10T00:00:00Z",
  "scrapedAt": "2026-08-12T03:05:00Z"
}
```

### Topic: `expired-job`

Publicado quando uma vaga não está mais ativa.

```json
{
  "jobId": "linkedin_456789",
  "reason": "not_found",
  "expiredAt": "2026-08-12T03:10:00Z"
}
```

---

## Estrutura do Projeto

```
job-tracker/
├── src/
│   ├── main.py                 # Entry point (Cloud Run)
│   ├── config.py               # Configurações (títulos, plataformas)
│   ├── scrapers/
│   │   ├── __init__.py
│   │   ├── base.py             # Classe base para scrapers
│   │   ├── linkedin.py         # Scraper LinkedIn (público)
│   │   ├── indeed.py           # Scraper Indeed
│   │   └── glassdoor.py        # Scraper Glassdoor
│   ├── extractors/
│   │   ├── __init__.py
│   │   └── job_extractor.py    # Extrai requirements/salary do HTML
│   ├── publishers/
│   │   ├── __init__.py
│   │   └── pubsub.py           # Publica mensagens no Pub/Sub
│   ├── storage/
│   │   ├── __init__.py
│   │   └── firestore.py        # CRUD de /jobs no Firestore
│   └── validators/
│       ├── __init__.py
│       └── job_validator.py    # Valida dados extraídos
├── tests/
│   ├── __init__.py
│   ├── test_scrapers.py
│   ├── test_extractors.py
│   └── test_validators.py
├── Dockerfile
├── requirements.txt
├── pyproject.toml
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD → Cloud Run
└── README.md
```

---

## Configuração

```python
# config.py

SEARCH_TITLES = [
    "Desenvolvedor Java",
    "Desenvolvedor Full Stack",
    "Backend Developer",
    "Java Developer",
    "Software Engineer",
    "Full Stack Engineer",
    "Desenvolvedor Spring Boot",
    "Desenvolvedor Go",
    "Angular Developer",
]

SEARCH_LOCATIONS = [
    "Brasil",
    "Remoto",
]

PLATFORMS_ENABLED = [
    "linkedin",
    "indeed",
]

# Pub/Sub
PUBSUB_TOPIC_NEW_JOB = "new-job"
PUBSUB_TOPIC_EXPIRED_JOB = "expired-job"

# Limites
MAX_JOBS_PER_PLATFORM = 200
SCRAPING_DELAY_SECONDS = (2, 5)  # Random entre requests
REQUEST_TIMEOUT = 30
```

---

## Extração de Dados

### Campos obrigatórios (vaga só é salva se tiver estes)

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| title | string | Sim |
| company | string | Sim |
| platform | string | Sim |
| url | string | Sim |

### Campos opcionais (best effort)

| Campo | Tipo | Fallback |
|-------|------|----------|
| location | string | "Não informado" |
| salary.min | number | null |
| salary.max | number | null |
| requirements | string[] | [] |
| responsibilities | string[] | [] |
| workModel | enum | null |
| experienceLevel | string | null |
| postedAt | Timestamp | null |

---

## Detecção de Expiração

Estratégia para verificar se vagas existentes ainda estão ativas:

1. **HEAD request** na URL da vaga
   - 404 / 410 → Expirada
   - 301 para página genérica → Expirada
   - 200 → Verificar se conteúdo ainda tem "Apply" / "Candidatar"

2. **Idade máxima** — vagas com > 30 dias sem re-confirmação são marcadas como expiradas

3. **Rate limiting** — máximo 100 verificações por execução (não sobrecarregar plataformas)

---

## Deduplicação

Uma vaga é considerada duplicada se:
- Mesmo `url` (primary key)
- OU mesmo `(company + title + location)` case-insensitive em plataformas diferentes

ID da vaga: `{platform}_{hash(url)}` — determinístico, idempotente.

---

## Tratamento de Erros

| Erro | Ação |
|------|------|
| Plataforma retorna 429 (rate limit) | Backoff exponencial, tenta outra plataforma |
| Timeout de request | Retry 3x com delay, depois pula |
| HTML inesperado (mudança de layout) | Log warning, pula vaga, alerta em monitoring |
| Firestore indisponível | Retry 3x, depois falha com alerta |
| Pub/Sub falha ao publicar | Retry 3x com backoff |

---

## Observabilidade

| Métrica | Onde |
|---------|------|
| Vagas novas por execução | Cloud Logging (structured log) |
| Vagas expiradas por execução | Cloud Logging |
| Erros de scraping por plataforma | Cloud Logging + alertas |
| Tempo total de execução | Cloud Run metrics |
| Mensagens publicadas no Pub/Sub | Pub/Sub metrics |

---

## Deploy (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy Job Tracker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write  # Workload Identity

    steps:
      - uses: actions/checkout@v4

      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.SA_EMAIL }}

      - uses: google-github-actions/setup-gcloud@v2

      - name: Build and Deploy
        run: |
          gcloud run deploy job-tracker \
            --source . \
            --region us-central1 \
            --no-allow-unauthenticated \
            --set-env-vars "GCP_PROJECT=${{ secrets.GCP_PROJECT }}"
```

---

## Cloud Scheduler

```bash
gcloud scheduler jobs create http job-tracker-daily \
  --schedule="0 3 * * *" \
  --uri="https://job-tracker-XXXXX.run.app/run" \
  --http-method=POST \
  --oidc-service-account-email=scheduler@PROJECT.iam.gserviceaccount.com \
  --time-zone="America/Sao_Paulo"
```

---

## Testes

| Tipo | O que testa |
|------|------------|
| Unit | Extração de dados de HTML mockado |
| Unit | Deduplicação de vagas |
| Unit | Validação de campos obrigatórios |
| Integration | Publicação no Pub/Sub (emulador) |
| Integration | Leitura/escrita no Firestore (emulador) |
| E2E (manual) | Scraping real em ambiente de dev |

---

## Limitações Conhecidas

1. Scraping pode quebrar se plataformas mudarem HTML
2. LinkedIn limita requests não autenticados (~100/hora estimado)
3. Extração de salário é inconsistente (muitas vagas não informam)
4. Extração de requirements depende de formato da descrição (pode ser impreciso)
