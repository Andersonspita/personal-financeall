# Documentação técnica — Bússola Financeira

Aplicação web **Next.js 16** (App Router) + **React 19** + **Prisma 7** (SQLite) para finanças pessoais com apoio emocional. Requisitos de produto: [`Requisito.MD`](../Requisito.MD). Guia de uso: [`docs/usuario.md`](usuario.md).

## Stack

| Camada | Tecnologia |
|---|---|
| UI | Next.js 16 App Router, React 19, Tailwind CSS 4, lucide-react, recharts |
| Persistência | Prisma 7, adapter `better-sqlite3`, SQLite (`prisma/dev.db`) |
| Auth | JWT HS256 (`jose`, Edge-compatible), cookie httpOnly `session` e Bearer |
| Senha | `bcryptjs` |
| Validação | Zod 4 (`src/lib/validation.ts`, `src/lib/auth/schemas.ts`); erros por campo via `src/lib/errors.ts` |
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
| `AUTH_COOKIE_SECURE` | `true`/`false`. Em `http://IP:porta` use `false`; em HTTPS omita ou use `true` |
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
- **Server Actions** em `src/actions/` mutam dados e revalidam rotas. Erros de validação voltam como `{ error, fieldErrors }` (`src/lib/errors.ts`), não como `throw` genérico — Server Actions serializam mal classes de erro.
- **Route Handlers** em `src/app/api/` servem a web e um futuro cliente móvel (mesmo JWT).
- Lógica de negócio testável fica em `src/lib` sem I/O quando possível (`budgeting.ts`, `cash-flow.ts`, `anomaly-detection.ts`, `vulnerability-score.ts`, `auth/schemas.ts`).
- Não há uma pasta `domain/application/infrastructure` no estilo Clean Architecture: no App Router isso costuma virar indireção vazia. A divisão real é **página → action → lib**.

Telas grandes foram fatiadas: orçamentos (`components/budgets/`), lista de lançamentos (`transaction-row.tsx`), trava de resfriamento (`wishlist-item-form.tsx`), contas de dinheiro em Configurações (`components/settings/money-account-*.tsx`). CRUD de `Account` em `src/actions/accounts.ts` e de `Category` em `src/actions/categories.ts` (criar, editar, arquivar, reativar). A última conta ativa, a última categoria de renda e a última de gasto não podem ser arquivadas. Nomes de categoria são únicos por usuário, inclusive entre arquivadas.

## Autenticação

Fluxo único em `src/lib/auth/service.ts` (schemas em `src/lib/auth/schemas.ts`), reutilizado por actions e APIs.

1. Registro cria `User`, hash da senha e dados iniciais (`createDefaultDataForUser`: conta, categorias e `Budget` do mês para as que têm teto). Contas só-Google nascem sem `passwordHash`.
2. Login verifica senha e emite JWT (30 dias). Sem senha (só Google), a mensagem pede o botão Google — não revela se o e-mail existe quando a senha está errada.
3. Web: cookie `session` httpOnly, `SameSite=lax`. `Secure` segue `AUTH_COOKIE_SECURE` (padrão: ligado em `NODE_ENV=production`). Sem HTTPS (acesso por `http://IP:porta`), defina `AUTH_COOKIE_SECURE=false` ou o navegador ignora o cookie e o login parece falhar.
4. API / app móvel: `Authorization: Bearer <token>` tem prioridade sobre o cookie (`src/lib/auth/session.ts`).
5. `middleware.ts` protege tudo exceto `/login`, `/registrar`, `/recuperar-senha`, `/api/auth/login`, `/api/auth/register`, `/api/auth/google` (+ callback) e estáticos PWA.
6. Recuperação de senha: token aleatório no e-mail, **hash SHA-256** no banco (`PasswordResetToken`), 1 hora, uso único. Sem SMTP/Resend o link só vai para o log do servidor (útil no `npm run dev`). Não revela se o e-mail existe.
7. Google OAuth (PKCE): `GET /api/auth/google` → callback. Precisa de `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e redirect `{APP_BASE_URL}/api/auth/google/callback`. E-mail Google já cadastrado é **vinculado** (`googleId`), não duplicado.

Rotas:

| Método | Caminho | Papel |
|---|---|---|
| POST | `/api/auth/register` | Cria conta; devolve `{ user, token }` (201) |
| POST | `/api/auth/login` | Autentica; devolve `{ user, token }` |
| GET | `/api/auth/google` | Inicia OAuth Google |
| GET | `/api/auth/google/callback` | Troca o código, cria/vincula usuário, grava cookie |
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
- `BehavioralProfile` (RF10) é tabela separada do lançamento; respostas do onboarding não entram no score de vulnerabilidade nem no export.
- IA desligada por padrão (`User.aiAssistantEnabled`). Só envia sinais agregados depois do opt-in.

## Regras de domínio

### Orçamento (RF02)

`src/lib/budgeting.ts`: alerta em 80% e 100% do teto; grupos de **gasto** `essencial` / `variavel` / `poupanca` (50-30-20) e grupo de **renda** `renda` (salário e outras entradas). No lançamento, receita só lista categorias `renda` e despesa só lista as de gasto (`filterCategoriesByLaunchType`). Categorias com `archived: true` não entram em lançamento novo, na trava de resfriamento nem em `ensureCurrentMonthBudgets`; na edição de um lançamento, a categoria atual permanece selecionável. `categoryLaunchTypeError` recusa combinação invertida. `nextBudgetAlertStamps` decide o que gravar; `syncBudgetAlertsForCategory` persiste `alert80SentAt` / `alert100SentAt` (uma vez por teto/mês) e cria um nudge in-app com o texto de `BUDGET_ALERT_COPY`. Sem web push ou e-mail. Lançamentos existentes podem ser alterados em `/transacoes/[id]/editar` (`updateTransaction`). Regras de arquivar categoria: `src/lib/categories.ts`.

A série do gráfico de fluxo (`accumulateDailyNet`, `buildCashFlowChartSeries`) vive em `src/lib/cash-flow.ts`; `dashboard.ts` só busca dados e monta os totais.

### Detector de impulso (RF04)

`src/lib/rules/anomaly-detection.ts` (puro, testado):

- 4ª despesa não essencial em 24h → `frequencia_24h`
- despesa entre 0h e 6h (hora local) → `compra_madrugada`

O flag `Transaction.isImpulse` é informativo; o usuário pode descartar.

### Score de vulnerabilidade (RF09)

1. Sinais dos últimos 7 dias em `computeCurrentVulnerability`.
2. Score 0–100 em `computeVulnerabilityScore` (pesos de impulso, madrugada e mix emocional).
3. Nível (`baixo` / `medio` / `alto` / `critico`) via decision table Zen (`vulnerability-level.json`): crítico ≥ 80, alto 55–79, médio 30–54, senão baixo.
4. Persistência em `VulnerabilityScore`. Três avaliações críticas consecutivas disparam canais de apoio (`CRITICAL_STREAK_THRESHOLD`). O perfil declarado no onboarding **não** entra no cálculo numérico.

### Perfil comportamental (RF10)

`User.onboardingStatus`: `pending` | `completed` | `skipped` (padrão `pending` em conta nova). Após cadastro/login, redireciona para `/onboarding` se `pending`; o layout `(app)` também redireciona quem tentar pular a etapa.

`BehavioralProfile` (1:1 com `User`): `primaryGoal`, `typicalTrigger`, `cooldownHours`, `incomeRhythm`, `supportStyle`, `completedAt`, `skippedAt`. Validação em `src/lib/profile/schemas.ts`; serviço em `src/lib/profile/service.ts`; textos em `src/lib/profile/copy.ts`.

Efeitos:

- trava de resfriamento: `getDefaultCooldownHours` → `WishlistItemForm`
- recomendação em `/aprender`: `rankRecommendedContent` usa emoção observada (RF05) ou, sem histórico, `typicalTrigger` declarado
- Início: `dashboardProfileHint` enquanto não houver `EmotionLog` nos lançamentos recentes
- Configurações: `ProfileSettingsForm` edita o perfil

### Nudges (RF07)

`maybeGenerateNudge`: 3+ despesas da mesma categoria, em 14 dias, ligadas a emoções de impulso (`ansioso`, `entediado`, `estressado`, `triste`), sem nudge aberto da mesma regra. O teto de orçamento também gera nudge (`teto_80:` / `teto_100:`). O último nudge não descartado aparece no dashboard (`NudgeBanner`).

### Educação

Cursos curados em `src/lib/education/courses.ts`, aulas em `content.ts`, vídeos em `videos.ts` (embed `youtube-nocookie.com`). `ensureEducationalCatalog()` (upsert por slug) roda ao abrir `/aprender` — a VPS não precisa do seed demo. Recomendação usa a emoção de maior gasto nos últimos 30 dias; sem dados, o gatilho do `BehavioralProfile`. Progresso de curso é derivado das aulas (`progress.ts`).

### IA

Escopo fechado (`src/lib/ai/prompts.ts`): no máximo 3–4 frases, tom não-punitivo, sem diagnóstico. Funções: explicar o score e gerar pergunta na wishlist. Sem `OPENAI_API_KEY` ou sem opt-in, as actions lançam `AiUnavailableError`.

## Rotas de UI

| Rota | Função |
|---|---|
| `/` | Dashboard |
| `/transacoes` | Lista (editar / excluir) |
| `/transacoes/novo` | Formulário RF01; categorias filtradas por receita/despesa |
| `/transacoes/[id]/editar` | Correção de lançamento |
| `/orcamentos` | Renda vs tetos de gasto, editar/arquivar categorias e 50-30-20 |
| `/desejos` | Cooling-off 24–72h |
| `/correlacao` | Matriz emoção × gasto |
| `/panico` | Desvio de foco |
| `/aprender` | Cursos e recomendações |
| `/aprender/cursos/[slug]` | Aulas de um curso |
| `/aprender/[slug]` | Aula (anterior/próxima se estiver num curso) |
| `/configuracoes` | Conta, **Seu jeito** (perfil RF10) e toggle de IA |
| `/onboarding` | Questionário pós-cadastro (5 passos, pulável) |
| `/login` `/registrar` | Públicas |
| `/recuperar-senha` | Pedido de link |
| `/recuperar-senha/[token]` | Nova senha |

## Comunicação (RNF03)

Textos de alerta, score e pânico centralizados em `src/lib/copy.ts`. Novas frases perto de gasto, orçamento ou vulnerabilidade devem nascer ali, não ad hoc na tela.

## Testes

```
src/lib/budgeting.test.ts
src/lib/cash-flow.test.ts
src/lib/crypto.test.ts
src/lib/validation.test.ts
src/lib/categories.test.ts
src/lib/auth/schemas.test.ts
src/lib/auth/reset-token.test.ts
src/lib/rules/anomaly-detection.test.ts
src/lib/rules/vulnerability-score.test.ts
src/lib/profile/profile.test.ts
```

Cubram lógica pura e bordas (valor zero/NaN/Infinity, mês 13, cooldown 23h/73h, payload de cifra adulterado, lançamento fora do mês no gráfico). Mutações de banco e UI ainda não têm suíte de integração com SQLite. Falhas inesperadas nas actions/APIs vão para `logAppError` (JSON em stderr), não para `console.log(error)` solto.

## UI

- Títulos `h1` usam Source Serif 4 (identidade editorial); o restante permanece Geist.
- Botões: `src/components/ui/button.tsx` (`rounded-xl`, `pending` com spinner, `active:scale-[0.98]`). Não usar link sublinhado para ação primária/secundária.
- Campos: `Field` + `fieldControlClass` (borda crítica + `aria-invalid` + texto de erro no campo). Selects: `Select` (`appearance-none` + chevron). Cards: `rounded-2xl`, `p-5`.
- Mensagens de Zod em `src/lib/validation.ts` e `src/lib/auth/schemas.ts` estão em português.
- Relógio da trava de resfriamento (`Countdown`, `PendingWishCard`) só calcula `Date.now()` no cliente, depois do mount — evita mismatch de hidratação.
- Barra inferior: `env(safe-area-inset-bottom)` e `viewportFit: cover` para não ficar sob o indicador do iOS.
- Gráfico: Recharts com grade horizontal suave, curva `monotone` e eixo Y compacto.

## PWA

`PwaRegister` registra `/sw.js`. O worker **não** cacheia páginas HTML (evitar saldo desatualizado). Só `manifest.json` e `icon.svg`.

## Deploy na VPS (porta 3000)

Não use 80, 443, 8000, 8080 nem 8081 — já estão ocupadas nesta VPS (`vps10606` / `184.107.179.70`). A 3000 estava livre na varredura externa. Confirme **dentro** da máquina antes de subir:

```bash
ss -tlnp | grep -E ':(80|443|3000|8000|8080|8081)\s'
```

Se 3000 aparecer na lista, escolha outra (ex. `8082`) e troque `PORT` / UFW / systemd.

Rode como usuário `deploy` (pasta `/home/deploy/personal-financeall`), com `sudo` só onde indicado.

### 1. Pacotes (root ou sudo)

```bash
sudo apt-get update
sudo apt-get install -y git curl ca-certificates build-essential python3
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # precisa ser v20+
```

### 2. Clone e build (`deploy`)

```bash
sudo mkdir -p /home/deploy/personal-financeall
sudo chown -R deploy:deploy /home/deploy/personal-financeall
su - deploy
cd /home/deploy/personal-financeall
git clone https://github.com/Andersonspita/personal-financeall.git .
```

Se o GitHub pedir senha, o repo está privado: use um Personal Access Token no lugar da senha, ou um deploy key SSH.

```bash
cp .env.example .env
AUTH=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
EMO=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
cat > .env <<EOF
DATABASE_URL="file:./prisma/prod.db"
EMOTION_ENCRYPTION_KEY="$EMO"
AUTH_SECRET="$AUTH"
AUTH_COOKIE_SECURE="false"
# APP_BASE_URL="http://184.107.179.70:3000"
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# MAIL_FROM=""
# SMTP_HOST=""
EOF
chmod 600 .env

npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
```

Não rode `npm run db:seed` em produção (cria `demo@bussola.app` com senha conhecida). Crie a conta em `/registrar`.

### 3. Firewall e systemd (sudo)

```bash
sudo ufw allow 3000/tcp
sudo tee /etc/systemd/system/bussola-financeira.service >/dev/null <<'EOF'
[Unit]
Description=Bussola Financeira
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/personal-financeall
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
EnvironmentFile=/home/deploy/personal-financeall/.env
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -H 0.0.0.0 -p 3000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now bussola-financeira
sudo systemctl status bussola-financeira --no-pager
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/login
```

Acesso: `http://184.107.179.70:3000`

### Atualizar depois

```bash
su - deploy
cd /home/deploy/personal-financeall
git pull
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
sudo systemctl restart bussola-financeira
```

Só rode o `restart` se o `build` terminar com as rotas, sem erro de TypeScript. Um restart depois de `Failed to type check` derruba o processo e a porta 3000 fica fora.

Prisma 7 + SQLite **não** aceita `createMany({ skipDuplicates })` (o tipo vira `never` e o build quebra). Filtre duplicatas no código antes do insert.

## Extensão futura (já prevista no desenho)

### Web + iOS + Android

Três clientes, **um backend** (JWT cookie na web, Bearer nos apps). Hoje: Next.js + PWA. Apps nativos: provável wrapper (Capacitor/WebView) reutilizando a UI; login Google nativo e IAP depois.

### Bússola Plus (freemium — ainda sem cobrança no código)

Princípio: cuidado no momento da compra (trava, pânico, score básico, correlação 30 dias) permanece **grátis**.

| Grátis | Plus (assinatura mensal/anual, mesma conta nas três plataformas) |
|---|---|
| Lançamentos, orçamentos, dashboard, detector, score, correlação 30d, trava, pânico, encaminhamento, perfil RF10, curso “Ferramentas da Bússola” | IA, biblioteca completa de cursos, histórico além de 30d, export, push/e-mail de teto, mais contas |
| | Cobrança prevista: RevenueCat (iOS/Android IAP) + Stripe (web), mesmo `productId`. Flags futuras no `User`: `plan`, `plusExpiresAt`. |

- App iOS/Android: reutilizar `/api/auth/*` + Bearer; schema já é `userId`-centric.
- Postgres: trocar provider/adapter no Prisma; o restante do domínio não depende de SQL específico além do SQLite atual.
- Notificações externas de teto: web push ou e-mail (os timestamps `alert80SentAt` / `alert100SentAt` já são gravados; o recado hoje é in-app).

## Convenção para quem altera o código

Depois de mudar comportamento, atualize `docs/usuario.md`, `docs/tecnico.md` e `docs/andamento.md` no mesmo trabalho. Ver regra Cursor `.cursor/rules/atualizar-documentacao.mdc`.
