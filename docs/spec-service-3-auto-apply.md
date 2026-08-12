# Spec — Serviço 3: Auto Apply

## Resumo

Worker que roda em uma VM (Compute Engine e2-micro), escuta a fila de candidaturas no Firestore, e executa a submissão automática via Playwright (browser headless). Processa uma candidatura por vez, respeitando limites diários e delays anti-detecção.

---

## Responsabilidades

1. Escutar fila de candidaturas (/queue) no Firestore
2. Processar uma candidatura por vez (sequencial)
3. Abrir browser headless com Playwright
4. Navegar até a vaga e submeter Easy Apply
5. Preencher formulários multi-step inteligentemente
6. Fazer upload de currículo quando solicitado
7. Reportar resultado (sucesso/falha) de volta ao Firestore
8. Respeitar limites diários por plataforma
9. Aplicar delays aleatórios entre candidaturas
10. Retry automático com backoff em caso de falha

---

## Stack Técnica

| Componente | Tecnologia |
|-----------|-----------|
| Linguagem | Python 3.12+ |
| Automação de browser | Playwright (Chromium, headless) |
| Banco | Firestore (client SDK Python) |
| Storage | Firebase Storage (download de CVs) |
| Hospedagem | Compute Engine (e2-micro, always free) |
| Process manager | systemd |
| CI/CD | GitHub Actions → SSH + git pull + restart |

---

## Fluxo de Execução

```
Worker inicia (systemd, boot da VM)
      │
      ▼
Loop infinito:
      │
      ├── 1. Verifica quota diária
      │      └── Atingiu limite? → Sleep até meia-noite → Continua
      │
      ├── 2. Poll Firestore: /queue
      │      Query: status == "pending", orderBy createdAt, limit 1
      │      └── Fila vazia? → Sleep 30s → Volta ao loop
      │
      ├── 3. Claim do item (atualiza status → "processing")
      │
      ├── 4. Prepara candidatura
      │      ├── Busca dados do usuário (/users/{userId})
      │      ├── Busca dados da vaga (/jobs/{jobId})
      │      └── Download do currículo (Storage)
      │
      ├── 5. Executa candidatura
      │      ├── Abre browser Playwright (headless)
      │      ├── Carrega sessão salva da plataforma
      │      ├── Navega para URL da vaga
      │      ├── Clica "Easy Apply" / "Candidatura Simplificada"
      │      ├── Preenche formulário (multi-step)
      │      ├── Upload de currículo
      │      ├── Submete
      │      └── Verifica confirmação
      │
      ├── 6. Reporta resultado
      │      ├── Sucesso → status: "completed", result: {success: true}
      │      └── Falha → 
      │           ├── Attempts < maxAttempts → status: "pending" (retry)
      │           └── Attempts >= maxAttempts → status: "failed"
      │
      ├── 7. Fecha browser
      │
      └── 8. Delay aleatório (30-90s) → Volta ao loop
```

---

## Fila (Firestore /queue)

### Schema do documento

```python
{
    "id": "auto-generated",
    "userId": "user_123",
    "jobId": "job_456",
    "platform": "linkedin",
    
    # Controle de fila
    "status": "pending",  # pending | processing | completed | failed | cancelled
    "priority": 1,        # 0 = urgente, 1 = normal
    "createdAt": Timestamp,
    "startedAt": None,
    "completedAt": None,
    
    # Dados para candidatura
    "resumePath": "cvs/user_123/resume.pdf",
    "userPhone": "5527997867470",
    "userEmail": "user@email.com",
    "userLocation": "Vila Velha, ES",
    "userSkills": ["Java", "Spring Boot", "SQL"],
    "matchScore": 0.85,
    "jobUrl": "https://linkedin.com/jobs/view/456",
    "jobTitle": "Java Developer",
    "jobCompany": "Nubank",
    
    # Resultado
    "result": None,  # {success: bool, message: str, screenshotUrl: str|None}
    
    # Retry
    "attempts": 0,
    "maxAttempts": 3,
    "lastError": None,
    "nextRetryAt": None
}
```

### Transições de estado

```
pending ──► processing ──► completed ✓
   ▲              │
   │              ▼
   └────── failed (retry)
                  │
                  ▼ (max attempts)
              failed (final) ✗

pending ──► cancelled (pelo usuário via App 2)
```

---

## Limites e Controles

| Controle | Valor | Motivo |
|----------|-------|--------|
| Candidaturas/dia LinkedIn | 25 | Anti-bloqueio |
| Candidaturas/dia Indeed | 50 | Mais permissivo |
| Delay entre candidaturas | 30-90s (random) | Parecer humano |
| Delay entre ações no form | 1-3s (random) | Parecer humano |
| Timeout por candidatura | 10 min | Evitar travamento |
| Max retries | 3 | Não insistir infinitamente |
| Backoff entre retries | 5min, 30min, 2h | Crescente |
| Browser instances | 1 (sequencial) | Limite de RAM da VM |
| Sessão LinkedIn salva | Via Storage state JSON | Não requer login toda vez |

---

## Preenchimento de Formulários

### Estratégia

```python
DEFAULT_ANSWERS = {
    # Autorização de trabalho
    "autorizado|authorized|legally": "Sim/Yes",
    
    # Sponsorship
    "sponsorship|patrocínio|visto": "Não/No",
    
    # Experiência
    "years|anos|experience": "3",
    
    # Disponibilidade
    "notice period|disponibilidade|start": "Imediata/Immediately",
    
    # Modelo de trabalho
    "remote|remoto|hybrid|híbrido": "Sim/Yes",
    
    # Pretensão salarial
    "salary|salário|pretensão": "8000",
}
```

### Prioridade de botões (modal Easy Apply)

```
1. "Enviar candidatura" / "Submit application" → Clica (final)
2. "Revisar" / "Review" → Clica (pré-submit)
3. "Avançar" / "Next" / "Continuar" → Clica (próximo step)
4. Qualquer botão enabled que não seja "Voltar"/"Fechar" → Fallback
```

### Campos não respondidos

Se o bot encontra um campo que não sabe responder:
1. Log da pergunta em `/data/unanswered_questions.json`
2. Tenta submeter mesmo assim (campo pode ser opcional)
3. Se falhar, reporta como "pergunta não respondida" no resultado

---

## Gerenciamento de Sessão

### LinkedIn (principal)

```python
# Login manual (uma vez, via script de setup)
# Salva session state como JSON
# Worker carrega session state a cada candidatura

SESSION_FILE = "/home/app/data/sessions/linkedin_state.json"

def load_session() -> BrowserContext:
    context = browser.new_context(
        storage_state=SESSION_FILE,
        viewport={"width": 1366, "height": 768},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) ..."
    )
    return context

def verify_session(page: Page) -> bool:
    page.goto("https://linkedin.com/feed/")
    return "feed" in page.url  # Se redirecionou para login, sessão expirou
```

### Renovação de sessão

Se sessão expirar:
1. Worker detecta (redirect para login page)
2. Atualiza status no Firestore: `/worker/status = "session_expired"`
3. Para de processar fila
4. Notifica (ou aguarda renovação manual)

---

## Estrutura do Projeto

```
auto-apply/
├── src/
│   ├── main.py                  # Entry point (loop principal)
│   ├── config.py                # Configurações e limites
│   ├── worker/
│   │   ├── __init__.py
│   │   ├── queue_consumer.py    # Poll e claim de items da fila
│   │   ├── application_runner.py # Orquestra uma candidatura
│   │   └── rate_limiter.py      # Controle de quota diária
│   ├── browser/
│   │   ├── __init__.py
│   │   ├── session_manager.py   # Gerencia sessões/cookies
│   │   ├── form_filler.py       # Preenchimento inteligente
│   │   └── platforms/
│   │       ├── __init__.py
│   │       ├── linkedin.py      # Automação LinkedIn Easy Apply
│   │       └── indeed.py        # Automação Indeed (futuro)
│   ├── storage/
│   │   ├── __init__.py
│   │   ├── firestore_client.py  # Leitura/escrita Firestore
│   │   └── file_storage.py      # Download de CVs do Storage
│   └── utils/
│       ├── __init__.py
│       ├── delays.py            # Delays aleatórios
│       └── logging_config.py    # Structured logging
├── scripts/
│   ├── setup_vm.sh              # Setup inicial da VM
│   ├── login_linkedin.py        # Script para login manual
│   └── install_playwright.sh    # Instala Chromium
├── data/
│   ├── sessions/                # Session state JSONs
│   └── logs/                    # Logs locais
├── tests/
│   ├── __init__.py
│   ├── test_form_filler.py
│   ├── test_queue_consumer.py
│   └── test_rate_limiter.py
├── Dockerfile                   # (opcional, para teste local)
├── requirements.txt
├── pyproject.toml
├── auto-apply.service           # systemd unit file
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

---

## Setup da VM (e2-micro)

### Script de provisionamento

```bash
#!/bin/bash
# scripts/setup_vm.sh

# Update sistema
sudo apt-get update && sudo apt-get upgrade -y

# Python 3.12
sudo apt-get install -y python3.12 python3.12-venv python3-pip

# Dependências do Playwright
sudo apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxrandr2 \
  libgbm1 libpango-1.0-0 libcairo2 libasound2

# Swap (compensa 1GB RAM)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Clonar projeto
cd /home/app
git clone https://github.com/DaviRordigues/auto-apply.git
cd auto-apply

# Instalar dependências
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium

# Configurar systemd
sudo cp auto-apply.service /etc/systemd/system/
sudo systemctl enable auto-apply
sudo systemctl start auto-apply
```

### systemd service

```ini
# auto-apply.service
[Unit]
Description=Auto Apply Worker
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/home/app/auto-apply
ExecStart=/home/app/auto-apply/venv/bin/python src/main.py
Restart=always
RestartSec=30
Environment=GOOGLE_APPLICATION_CREDENTIALS=/home/app/service-account.json

[Install]
WantedBy=multi-user.target
```

---

## Deploy (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy Auto Apply

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
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.SA_EMAIL }}

      - uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to VM
        run: |
          gcloud compute ssh app@auto-apply-vm \
            --zone=us-central1-a \
            --command="cd /home/app/auto-apply && \
              git pull origin main && \
              source venv/bin/activate && \
              pip install -r requirements.txt && \
              sudo systemctl restart auto-apply"
```

---

## Observabilidade

| Métrica | Como |
|---------|------|
| Candidaturas/dia | Contador no Firestore (/worker/stats) |
| Taxa de sucesso | success / (success + failed) |
| Fila pendente | Query count em /queue status=pending |
| Status da sessão | /worker/status (active, session_expired, rate_limited) |
| Erros | Cloud Logging (structured) |
| Uptime | systemd + healthcheck endpoint |

### Health check

```python
# Endpoint local para monitoring
# GET http://localhost:8080/health

{
  "status": "healthy",
  "session_valid": true,
  "queue_size": 3,
  "daily_applied": 12,
  "daily_limit": 25,
  "last_application": "2026-08-12T14:30:00Z",
  "uptime_seconds": 43200
}
```

---

## Tratamento de Erros

| Erro | Ação |
|------|------|
| Sessão expirada | Pausa worker, atualiza status, aguarda renovação |
| Timeout (10min) | Marca como falha, fecha browser, próximo item |
| Campo não respondido | Tenta submeter, se falhar reporta pergunta |
| Rate limit da plataforma | Pausa até próximo dia |
| Browser crash | Restart browser, retry do item atual |
| VM reiniciou | systemd reinicia worker, retoma da fila |
| Item "processing" há > 15min | Cron de limpeza volta para "pending" |

---

## Segurança

| Aspecto | Medida |
|---------|--------|
| Credenciais | Service Account (não chave pessoal) |
| Sessão LinkedIn | Armazenada local na VM (não no repo) |
| Dados do usuário | Trafegam apenas internamente (Firestore) |
| Browser | Headless, sem extensões, perfil limpo |
| SSH | Apenas via IAP (Identity-Aware Proxy) |
| Logs | Não logam dados pessoais do candidato |

---

## Limitações Conhecidas

1. e2-micro tem 1GB RAM — só 1 browser por vez, com swap
2. Sessão do LinkedIn expira periodicamente (precisa renovação manual)
3. Mudanças na UI do LinkedIn quebram os seletores
4. Não lida com CAPTCHA ou MFA
5. Formulários com perguntas inéditas podem falhar
6. Deploy requer a VM estar online (não é serverless)
