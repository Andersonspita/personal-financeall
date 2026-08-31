# Andamento do projeto — Bússola Financeira

Documento vivo do progresso frente a [`Requisito.MD`](../Requisito.MD). Atualize a tabela de status e acrescente uma linha no histórico **sempre que o sistema mudar**.

**Última revisão:** 2026-08-31

## Resumo

O núcleo dos 9 requisitos funcionais e dos 3 não funcionais está implementado em um app web autenticado, mobile-first, com PWA básico, SQLite local e testes da lógica de orçamento, anomalia e score. Falta endurecer produção (banco compartilhado, recuperação de senha, app nativo).

## Status dos requisitos

Legenda: **Pronto** · **Parcial** · **Pendente**

### Funcionais

| ID | Requisito | Status | Onde vive | Observação |
|---|---|---|---|---|
| RF01 | Lançamento com tag emocional | Pronto | `/transacoes/novo`, `/transacoes/[id]/editar`, `EmotionLog` | Edição; nota cifrada. Categorias filtradas por receita/despesa |
| RF02 | Tetos e 50-30-20, alerta 80%/100% | Pronto | `/orcamentos`, `budgeting.ts`, `budget-alerts.ts` | Grupo `renda` separado. Timestamps gravados uma vez por mês; recado in-app. Sem push/e-mail |
| RF03 | Dashboard de fluxo de caixa | Pronto | `/`, `dashboard.ts`, `cash-flow.ts` | Saldo, fixas vs variáveis, projeção linear; série do gráfico extraída e testada |
| RF04 | Detector de anomalias | Pronto | `anomaly-detection.ts` | Frequência 24h e madrugada; flag descartável |
| RF05 | Matriz emoção × gasto | Pronto | `/correlacao` | Últimos 30 dias |
| RF06 | Trava de resfriamento 24–72h | Pronto | `/desejos` | Confirmar ou descartar após o prazo |
| RF07 | Feed de nudges | Pronto | `nudges.ts` + `/aprender` | Nudge contextual + 3 cursos com aulas |
| RF08 | Botão de pânico / desvio de foco | Pronto | `/panico` | Quatro microatividades; desfecho autodeclarado |
| RF09 | Score de vulnerabilidade e encaminhamento | Pronto | `vulnerability-score.ts`, Zen Engine | Apoio após 3 scores críticos seguidos |

### Não funcionais

| ID | Requisito | Status | Observação |
|---|---|---|---|
| RNF01 | Mobile-first e PWA | Parcial | Layout responsivo + installable + safe-area no menu. SW não oferece modo offline das telas (de propósito, para não cachear saldo) |
| RNF02 | Sigilo e isolamento (LGPD) | Parcial | EmotionLog separado, nota AES-256-GCM, export sem emoção, IA opt-in. O rótulo `emotion` não é cifrado; SQLite em arquivo local não é isolamento multi-tenant de nuvem |
| RNF03 | Tom não-punitivo | Pronto | `src/lib/copy.ts` e textos das telas |

### Extra já no produto (fora da lista original)

| Item | Status |
|---|---|
| Contas multiusuário com JWT (web + Bearer) | Pronto |
| Biblioteca educativa com progresso | Pronto (agora em cursos, 3 trilhas) |
| Assistente de IA de escopo fechado | Pronto (opcional; depende de `OPENAI_API_KEY`) |
| Seed demo | Pronto (`demo@bussola.app`) |
| Testes unitários do domínio | Parcial (12 arquivos; sem suíte de banco/UI) |
| App iOS/Android | Pendente (API já client-agnostic) |
| Recuperação de senha / verificação de e-mail | Parcial (reset por e-mail; sem verificação de cadastro) |
| Login Google | Pronto (opcional; `GOOGLE_CLIENT_ID` + secret + redirect) |
| Postgres / deploy em nuvem | Pendente |
| Deploy VPS (systemd, porta 3000) | Pronto (roteiro em `docs/tecnico.md`; HTTP com `AUTH_COOKIE_SECURE=false`) |
| Cadastro de contas de dinheiro | Pronto (Configurações; arquivar, sem apagar histórico) |
| Cadastro de categorias | Pronto (Orçamentos; editar, arquivar, sem apagar histórico) |

## Histórico

### 2026-08-27 — Baseline documentada e repositório

O código já entregava o fluxo completo de cadastro, lançamentos com emoção, orçamentos, dashboard, detector de impulso, matriz emocional, wishlist, pânico, nudges, educação, score Zen e IA opt-in. Neste marco:

- Criadas as documentações de usuário, técnica e andamento (`docs/`).
- README passou a ser o índice do produto, não o template do `create-next-app`.
- Definida a regra Cursor para atualizar as três docs a cada mudança de sistema.
- Projeto versionado e publicado em https://github.com/Andersonspita/personal-financeall.git

### 2026-08-27 — Deploy na VPS (porta 3000)

As portas 80, 443, 8000, 8080 e 8081 já estavam em uso na VPS. O app sobe em **3000** (livre). Cookie `Secure` passou a respeitar `AUTH_COOKIE_SECURE` para login funcionar em `http://IP:porta`. Roteiro em `docs/tecnico.md`.

### 2026-08-27 — Categorias renda/gasto e edição de lançamento

Categorias de **renda** (ex.: Salário) ficam separadas das de **gasto**. No lançamento, receita e despesa mostram listas diferentes. Dá para **editar** um lançamento depois de salvar. Contas antigas ganham a categoria Salário na primeira visita a Lançar ou Orçamentos.

### 2026-08-27 — Layout da trava de resfriamento no celular

O select de categoria ao lado do valor estourava o card (largura mínima nativa do `<select>`). Campos passam a empilhar em coluna; cards e o `select` não ultrapassam a tela.

### 2026-08-28 — Persistência dos alertas de teto (RF02)

Ao cruzar 80% ou 100% do teto, o app grava `alert80SentAt` / `alert100SentAt` (uma vez por categoria/mês) e cria um nudge com o texto acolhedor. O recado aparece ao salvar o lançamento e no Início até **Entendi**. Contas novas já nascem com tetos do mês nas categorias que têm limite (Delivery, Lazer…). Sem web push nem e-mail.

### 2026-08-28 — Build na VPS: skipDuplicates no SQLite

O `next build` na VPS falhou porque `createMany({ skipDuplicates: true })` não existe no Prisma 7 + SQLite (o tipo é `never`). O `systemctl restart` depois disso derrubou o processo sem um `.next` novo. Removido o flag; a filtragem de tetos já existentes continua no código.

### 2026-08-28 — Polimento visual mobile

Menu inferior com espaço entre itens, rótulos curtos e recuo da safe-area do iOS. Lançamentos usam ícones de editar/excluir com área de toque maior. Selects customizados (sem a seta nativa da Apple). Gráfico de fluxo com grade suave, curva monotone e eixo compacto. Botões e inputs padronizados em `rounded-xl`; cards em `rounded-2xl` com mais respiro.

### 2026-08-28 — Passagem de qualidade (arquitetura, testes, formulários)

Sem reescrever o App Router em “Clean Architecture” de pastas: a divisão continua página → Server Action → `src/lib`. Extraídos `cash-flow.ts`, `errors.ts`, `auth/schemas.ts` e componentes de orçamento/lançamento/desejos. Validação Zod em português com erro **por campo** (`Field`, `aria-invalid`). Falhas inesperadas vão para log JSON (`logAppError`); token JWT inválido continua sendo “sem sessão”. Suíte de testes passou de 3 para 7 arquivos (validação, cifra, série de fluxo, schemas de auth, bordas). Títulos em Source Serif; botões com spinner e microinteração de clique. A trava de resfriamento deixa de usar `Date.now()` no Server Component (isso gerava aviso de hidratação).

### 2026-08-28 — Recuperação de senha e Google

Dá para pedir um link em **Esqueci a senha** (token com hash, 1 hora, mensagem genérica). Sem SMTP/Resend o link só sai no log do servidor. **Continuar com Google** cria ou vincula a conta pelo e-mail verificado (PKCE). `passwordHash` passou a ser opcional. Não há verificação de e-mail no cadastro por senha.

### 2026-08-28 — Contas de dinheiro na UI

Em Configurações dá para criar, editar e arquivar contas (corrente, poupança, cartão, dinheiro, investimento). Sem SMTP/Google nesta etapa. Arquivar não apaga lançamentos; a última conta ativa fica. O saldo inicial de contas arquivadas continua no Início.

### 2026-08-31 — Cursos em Aprender

As 10 leituras curtas passaram a 3 cursos (Emoções e compras, Ferramentas da Bússola, Dinheiro no dia a dia), com progresso por aula, aula anterior/próxima e catálogo gravado na primeira visita a `/aprender` (sem seed demo na VPS).

### 2026-08-31 — Vídeos do YouTube nas aulas

Cada curso e aula passam a ter um vídeo sugerido (mentalidade financeira, Serasa Ensina, 50-30-20, Banco Central, compras compulsivas). O player usa `youtube-nocookie.com`. O texto da Bússola continua o material principal.

### 2026-08-31 — Editar e arquivar categorias

Em **Orçamentos** dá para mudar nome, ícone e grupo, e arquivar categorias que não entram mais em lançamentos novos. O histórico permanece. A última de renda e a última de gasto ficam ativas. Nome duplicado (inclusive arquivado) pede para reativar em vez de criar outra.

## Próximos passos sugeridos

1. Trocar SQLite por Postgres quando houver deploy multi-usuário.
2. Configurar SMTP/Resend e o OAuth do Google na VPS (`APP_BASE_URL`, domínio com HTTPS). Google não aceita IP como origem/redirect.
3. Rotação de `AUTH_SECRET` / chave de cifra.
4. Testes de integração com banco (actions, export sem vazar EmotionLog).
5. Cliente móvel usando as rotas `/api/auth/*` e Bearer.
6. Cifrar ou tokenizar o rótulo `emotion` se a política de sigilo exigir mais do que o isolamento atual.
7. Web push ou e-mail no teto, reusando os timestamps já gravados.

## Como manter este arquivo

1. Mude o status na tabela se o requisito avançou ou recuou.
2. Some uma entrada `### AAAA-MM-DD — título` no histórico.
3. Ajuste “Próximos passos” e a data de última revisão.
