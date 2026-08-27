# Andamento do projeto — Bússola Financeira

Documento vivo do progresso frente a [`Requisito.MD`](../Requisito.MD). Atualize a tabela de status e acrescente uma linha no histórico **sempre que o sistema mudar**.

**Última revisão:** 2026-08-27

## Resumo

O núcleo dos 9 requisitos funcionais e dos 3 não funcionais está implementado em um app web autenticado, mobile-first, com PWA básico, SQLite local e testes da lógica de orçamento, anomalia e score. Falta endurecer produção (banco compartilhado, recuperação de senha, persistência dos alertas de teto, app nativo).

## Status dos requisitos

Legenda: **Pronto** · **Parcial** · **Pendente**

### Funcionais

| ID | Requisito | Status | Onde vive | Observação |
|---|---|---|---|---|
| RF01 | Lançamento com tag emocional | Pronto | `/transacoes/novo`, `/transacoes/[id]/editar`, `EmotionLog` | Edição; nota cifrada. Categorias filtradas por receita/despesa |
| RF02 | Tetos e 50-30-20, alerta 80%/100% | Parcial | `/orcamentos`, `budgeting.ts` | Grupo `renda` separado dos tetos. Alertas na UI; timestamps de alerta ainda não gravados |
| RF03 | Dashboard de fluxo de caixa | Pronto | `/`, `dashboard.ts` | Saldo, fixas vs variáveis, projeção linear |
| RF04 | Detector de anomalias | Pronto | `anomaly-detection.ts` | Frequência 24h e madrugada; flag descartável |
| RF05 | Matriz emoção × gasto | Pronto | `/correlacao` | Últimos 30 dias |
| RF06 | Trava de resfriamento 24–72h | Pronto | `/desejos` | Confirmar ou descartar após o prazo |
| RF07 | Feed de nudges | Pronto | `nudges.ts` + `/aprender` | Nudge contextual + biblioteca recomendada |
| RF08 | Botão de pânico / desvio de foco | Pronto | `/panico` | Quatro microatividades; desfecho autodeclarado |
| RF09 | Score de vulnerabilidade e encaminhamento | Pronto | `vulnerability-score.ts`, Zen Engine | Apoio após 3 scores críticos seguidos |

### Não funcionais

| ID | Requisito | Status | Observação |
|---|---|---|---|
| RNF01 | Mobile-first e PWA | Parcial | Layout responsivo + installable. SW não oferece modo offline das telas (de propósito, para não cachear saldo) |
| RNF02 | Sigilo e isolamento (LGPD) | Parcial | EmotionLog separado, nota AES-256-GCM, export sem emoção, IA opt-in. O rótulo `emotion` não é cifrado; SQLite em arquivo local não é isolamento multi-tenant de nuvem |
| RNF03 | Tom não-punitivo | Pronto | `src/lib/copy.ts` e textos das telas |

### Extra já no produto (fora da lista original)

| Item | Status |
|---|---|
| Contas multiusuário com JWT (web + Bearer) | Pronto |
| Biblioteca educativa com progresso | Pronto |
| Assistente de IA de escopo fechado | Pronto (opcional; depende de `OPENAI_API_KEY`) |
| Seed demo | Pronto (`demo@bussola.app`) |
| Testes unitários do domínio | Parcial (3 arquivos) |
| App iOS/Android | Pendente (API já client-agnostic) |
| Recuperação de senha / verificação de e-mail | Pendente |
| Postgres / deploy em nuvem | Pendente |
| Deploy VPS (systemd, porta 3000) | Pronto (roteiro em `docs/tecnico.md`; HTTP com `AUTH_COOKIE_SECURE=false`) |

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

## Próximos passos sugeridos

1. Persistir `alert80SentAt` / `alert100SentAt` e, se fizer sentido, web push ou e-mail no teto.
2. Trocar SQLite por Postgres quando houver deploy multi-usuário.
3. Recuperação de senha e rotação de `AUTH_SECRET` / chave de cifra.
4. Ampliar testes (actions, auth, export sem vazar EmotionLog).
5. Cliente móvel usando as rotas `/api/auth/*` e Bearer.
6. Cifrar ou tokenizar o rótulo `emotion` se a política de sigilo exigir mais do que o isolamento atual.

## Como manter este arquivo

1. Mude o status na tabela se o requisito avançou ou recuou.
2. Some uma entrada `### AAAA-MM-DD — título` no histórico.
3. Ajuste “Próximos passos” e a data de última revisão.
