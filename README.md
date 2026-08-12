# Match Engine (Serviço 2)

Plataforma principal: cadastro de candidatos, cálculo de match com vagas, e interface web moderna.

## O que faz

- Cadastra candidatos e extrai qualificações do CV
- Escuta vagas novas/expiradas via Pub/Sub
- Calcula match (skills do candidato × requisitos da vaga)
- Exibe ranking de vagas compatíveis
- Envia solicitação de candidatura para o Serviço 3

## Stack

- TypeScript
- Next.js 14 (frontend)
- Cloud Functions for Firebase (backend)
- Firestore + Firebase Auth + Storage
- Tailwind CSS

## Desenvolvimento local (modo mock)

```bash
cd web
npm install
npm run dev
```

O modo mock não requer Firebase — usa dados simulados para testar a UX.

## Frontend com mock

Variável de ambiente para ativar mock:
```
NEXT_PUBLIC_MOCK_MODE=true
```

## Deploy

Push para `main` → GitHub Actions → `firebase deploy` (automático).
