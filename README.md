# Bússola Financeira

Finanças pessoais com apoio emocional: lançamentos com estado de humor, tetos de gasto, detecção de compras por impulso, trava de resfriamento e encaminhamento acolhedor quando o padrão pede cuidado. Após o cadastro, um questionário curto personaliza a experiência antes do primeiro lançamento.

Não é um app de cobrança. O tom é de consciência, não de culpa. Requisitos de produto: [`Requisito.MD`](Requisito.MD).

## Documentação

| Público | Documento |
|---|---|
| Quem usa o app | [Guia do usuário](docs/usuario.md) |
| Quem desenvolve ou opera | [Documentação técnica](docs/tecnico.md) |
| Status do projeto (RF/RNF, histórico) | [Andamento](docs/andamento.md) |

Quando o sistema mudar, as três documentações devem ser atualizadas no mesmo trabalho.

## Stack

Next.js 16 · React 19 · Prisma 7 (SQLite) · JWT · Tailwind CSS 4 · Vitest · PWA

## Começar

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run db:seed    # opcional
npm run dev
```

Detalhes de variáveis, APIs, schema e **deploy na VPS** (porta 3000): [docs/tecnico.md](docs/tecnico.md).

Conta demo após o seed: `demo@bussola.app` / `demo12345` (somente desenvolvimento).

## Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Produção |
| `npm test` | Vitest |
| `npm run db:seed` | Usuário demo + cursos educativos |

## Repositório

https://github.com/Andersonspita/personal-financeall.git
