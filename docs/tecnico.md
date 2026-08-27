# Documentação técnica — Bússola Financeira

Aplicação web **Next.js 16** (App Router) + **React 19** + **Prisma 7** (SQLite) para finanças pessoais com apoio emocional. Requisitos de produto: [`Requisito.MD`](../Requisito.MD). Guia de uso: [`docs/usuario.md`](usuario.md).

## Stack

| Camada | Tecnologia |
|---|---|
| UI | Next.js 16 App Router, React 19, Tailwind CSS 4, lucide-react, recharts |
| Persistência | Prisma 7, adapter `better-sqlite3`, SQLite (`prisma/dev.db`) |
| Auth | JWT HS256 (`jose`, Edge-compatible), cookie httpOnly `session` e Bearer |
| Senha | `bcryptjs` |
| Validação | Zod 4 (`src/lib/validation.ts`) |
| Regras de negócio editáveis | `@gorules/zen-engine` + JDM em `src/lib/rules/vulnerability-level.json` |
| IA (opcional) | OpenAI (`gpt-4o-mini` por padrão), opt-in por usuário |
| Testes | Vitest (`src/**/*.test.ts`) |
| PWA | `public/manifest.json` + `public/sw.js` |

Pacotes nativos (`better-sqlite3`, `@gorules/zen-engine`) entram em `serverExternalPackages` em `next.config.ts` para o bundler do servidor não quebrar os bindings `.node`.

## Como rodar

```bash
npm install
cp .env.example .env   # no Windows: copy .env.example .env
```

Preencha `.env`:

| Variável | Função |
|---|---|
| `DATABASE_URL` | Caminho do SQLite, ex. `file:./prisma/dev.db` |
| `EMOTION_ENCRYPTION_KEY` | Segredo para AES-256-GCM das notas emocionais |
| `AUTH_SECRET` | Segredo do JWT |
| `OPENAI_API_KEY` | Opcional. Sem ela, o resto do app funciona; a IA fica indisponível |
| `OPENAI_MODEL` | Opcional. Padrão `gpt-4o-mini` |

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed          # opcional: usuário demo + conteúdo educativo
npm run dev              # http://localhost:3000
npm test
npm run build
```

Não commitar `.env`, `prisma/dev.db` nem `node_modules`. Pastas `actual/`, `maybe/`, `daylio-web/`, `mindlogger-web/`, `pattern/` e `zen/` são clones de pesquisa e estão no `.gitignore`.

O client Prisma é gerado em `src/generated/prisma` (também ignorado). Sem `prisma generate` o build falha.

## Arquitetura

```
src/
  app/                 rotas (App Router)
    (app)/             área autenticada (layout com Nav)
    api/               Route Handlers (auth + export)
    login/ registrar/
  actions/             Server Actions (formulários da web)
  components/
  lib/                 domínio puro + serviços de servidor
    auth/ crypto/ ai/ education/ rules/
  middleware.ts        guarda de sessão (página e API)
```

- **Server Components** leem o banco a cada request (`export const dynamic = "force-dynamic"` nas páginas com saldo/score). Cache de página seria saldo velho.
- **Server Actions** em `src/actions/` mutam dados e revalidam rotas.
- **Route Handlers** em `src/app/api/` servem a web e um futuro cliente móvel (mesmo JWT).
- Lógica de negócio testável fica em `src/lib` sem I/O quando possível (`budgeting.ts`, `anomaly-detection.ts`, `vulnerability-score.ts`).

## Autenticação

Fluxo único em `src/lib/auth/service.ts`, reutilizado por actions e APIs.

1. Registro cria `User`, hash da senha e dados iniciais (`createDefaultDataForUser`).
2. Login verifica senha e emite JWT (30 dias).
3. Web: cookie `session` httpOnly, `SameSite=lax`, `Secure` em produção.
4. API / app móvel: `Authorization: Bearer <token>` tem prioridade sobre o cookie (`src/lib/auth/session.ts`).
5. `middleware.ts` protege tudo exceto `/login`, `/registrar`, `/api/auth/login`, `/api/auth/register` e estáticos PWA.

Rotas:

| Método | Caminho | Papel |
|---|---|---|
| POST | `/api/auth/register` | Cria conta; devolve `{ user, token }` (201) |
| POST | `/api/auth/login` | Autentica; devolve `{ user, token }` |
| POST | `/api/auth/logout` | Apaga o cookie |
| GET | `/api/auth/me` | Usuário atual ou 401 |
| GET | `/api/export` | Extrato financeiro JSON **sem** EmotionLog |

## Modelo de dados

Schema: `prisma/schema.prisma`. SQLite não tem enums nativos: `type`, `group`, `emotion`, `level` e `status` são `String` validados no Zod.

Isolamento por `userId` em todo dado do usuário. Actions conferem dono da conta/categoria antes de gravar.

### Privacidade (RNF02)

- `EmotionLog` é tabela separada de `Transaction`.
- `noteEncrypted`: AES-256-GCM (`src/lib/crypto.ts`), chave derivada de `EMOTION_ENCRYPTION_KEY` via scrypt.
- O campo `emotion` (rótulo fechado) fica em claro na tabela isolada; a **nota livre** é que é cifrada.
- `/api/export` seleciona só campos financeiros.
- IA desligada por padrão (`User.aiAssistantEnabled`). Só envia sinais agregados depois do opt-in.

## Regras de domínio

### Orçamento (RF02)

`src/lib/budgeting.ts`: alerta em 80% e 100% do teto; grupos `essencial` / `variavel` / `poupanca` (50-30-20). Alertas são **calculados na leitura** e mostrados na UI. Os campos `alert80SentAt` / `alert100SentAt` existem no schema e **ainda não são gravados** (não há push/e-mail).

### Detector de impulso (RF04)

`src/lib/rules/anomaly-detection.ts` (puro, testado):

- 4ª despesa não essencial em 24h → `frequencia_24h`
- despesa entre 0h e 6h (hora local) → `compra_madrugada`

O flag `Transaction.isImpulse` é informativo; o usuário pode descartar.

### Score de vulnerabilidade (RF09)

1. Sinais dos últimos 7 dias em `computeCurrentVulnerability`.
2. Score 0–100 em `computeVulnerabilityScore` (pesos de impulso, madrugada e mix emocional).
3. Nível (`baixo` / `medio` / `alto` / `critico`) via decision table Zen (`vulnerability-level.json`): crítico ≥ 80, alto 55–79, médio 30–54, senão baixo.
4. Persistência em `VulnerabilityScore`. Três avaliações críticas consecutivas disparam canais de apoio (`CRITICAL_STREAK_THRESHOLD`).

### Nudges (RF07)

`maybeGenerateNudge`: 3+ despesas da mesma categoria, em 14 dias, ligadas a emoções de impulso (`ansioso`, `entediado`, `estressado`, `triste`), sem nudge aberto da mesma regra.

### Educação

Conteúdo curado em `src/lib/education/content.ts`, seed idempotente por `slug`. Recomendação usa a emoção de maior gasto nos últimos 30 dias.

### IA

Escopo fechado (`src/lib/ai/prompts.ts`): no máximo 3–4 frases, tom não-punitivo, sem diagnóstico. Funções: explicar o score e gerar pergunta na wishlist. Sem `OPENAI_API_KEY` ou sem opt-in, as actions lançam `AiUnavailableError`.

## Rotas de UI

| Rota | Função |
|---|---|
| `/` | Dashboard |
| `/transacoes` | Lista |
| `/transacoes/novo` | Formulário RF01 |
| `/orcamentos` | Tetos e 50-30-20 |
| `/desejos` | Cooling-off 24–72h |
| `/correlacao` | Matriz emoção × gasto |
| `/panico` | Desvio de foco |
| `/aprender` e `/aprender/[slug]` | Biblioteca |
| `/configuracoes` | Conta e toggle de IA |
| `/login` `/registrar` | Públicas |

## Comunicação (RNF03)

Textos de alerta, score e pânico centralizados em `src/lib/copy.ts`. Novas frases perto de gasto, orçamento ou vulnerabilidade devem nascer ali, não ad hoc na tela.

## Testes

```
src/lib/budgeting.test.ts
src/lib/rules/anomaly-detection.test.ts
src/lib/rules/vulnerability-score.test.ts
```

Cubram lógica pura. Mutações de banco e UI ainda não têm suíte.

## PWA

`PwaRegister` registra `/sw.js`. O worker **não** cacheia páginas HTML (evitar saldo desatualizado). Só `manifest.json` e `icon.svg`.

## Extensão futura (já prevista no desenho)

- App iOS/Android: reutilizar `/api/auth/*` + Bearer; schema já é `userId`-centric.
- Postgres: trocar provider/adapter no Prisma; o restante do domínio não depende de SQL específico além do SQLite atual.
- Notificações de teto: preencher `alert80SentAt` / `alert100SentAt` e um canal (web push ou e-mail).

## Convenção para quem altera o código

Depois de mudar comportamento, atualize `docs/usuario.md`, `docs/tecnico.md` e `docs/andamento.md` no mesmo trabalho. Ver regra Cursor `.cursor/rules/atualizar-documentacao.mdc`.
