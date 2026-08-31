import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { getDashboardData } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { VulnerabilityExplainerButton } from "@/components/ai/vulnerability-explainer-button";

// Dados financeiros e o score de vulnerabilidade têm que refletir o estado atual do banco
// a cada carregamento — nunca uma versão em cache da página.
export const dynamic = "force-dynamic";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { VulnerabilityBadge } from "@/components/vulnerability-badge";
import { BUDGET_ALERT_COPY } from "@/lib/copy";
import { formatCurrency, formatDate } from "@/lib/format";
import { EMOTION_EMOJI, EMOTION_LABELS, type Emotion } from "@/lib/emotions";
import { NudgeBanner } from "@/components/nudge-banner";
import { buttonClass } from "@/components/ui/control";

export default async function DashboardPage() {
  const user = await requireUser();
  const [data, dbUser] = await Promise.all([
    getDashboardData(user.id),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { aiAssistantEnabled: true } }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Visão geral</h1>
        <Link href="/transacoes/novo" className={buttonClass("primary", "px-4 py-2")}>
          <Plus size={16} /> Lançar
        </Link>
      </div>

      {data.openNudge && <NudgeBanner id={data.openNudge.id} message={data.openNudge.message} />}

      <Card>
        <CardTitle>Saldo disponível</CardTitle>
        <p className="text-3xl font-semibold tabular-nums">{formatCurrency(data.saldoDisponivel)}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-foreground-muted">Despesas fixas (mês)</p>
            <p className="font-medium tabular-nums">{formatCurrency(data.despesasFixas)}</p>
          </div>
          <div>
            <p className="text-foreground-muted">Despesas variáveis (mês)</p>
            <p className="font-medium tabular-nums">{formatCurrency(data.despesasVariaveis)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle className="mb-0">Projeção até o fim do mês</CardTitle>
          <span className="text-sm font-medium tabular-nums text-foreground-muted">
            {formatCurrency(data.projectedEndBalance)}
          </span>
        </div>
        <CashFlowChart data={data.chartData} />
      </Card>

      <Card>
        <CardTitle>Como você está</CardTitle>
        <VulnerabilityBadge level={data.vulnerability.level} />
        <Link href="/aprender" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary">
          <BookOpen size={15} /> Ver os cursos
        </Link>
        <VulnerabilityExplainerButton aiEnabled={dbUser.aiAssistantEnabled} />
      </Card>

      {data.budgetsWithSpent.length > 0 && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <CardTitle className="mb-0">Orçamentos do mês</CardTitle>
            <Link href="/orcamentos" className="text-xs font-medium text-primary">
              ver todos
            </Link>
          </div>
          <div className="flex flex-col gap-5">
            {data.budgetsWithSpent.slice(0, 4).map((b) => (
              <div key={b.id} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">
                    {b.category.icon} {b.category.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-sm text-foreground-muted">
                    {formatCurrency(b.spent)} / {formatCurrency(b.limitAmount)}
                  </span>
                </div>
                <ProgressBar ratio={b.limitAmount > 0 ? b.spent / b.limitAmount : 0} tone={b.alertLevel} />
                {b.alertLevel !== "dentro_do_limite" && (
                  <p className="mt-1 text-xs text-foreground-muted">
                    {b.alertLevel === "alerta_80"
                      ? BUDGET_ALERT_COPY.at80(b.category.name)
                      : BUDGET_ALERT_COPY.at100(b.category.name)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle className="mb-0">Lançamentos recentes</CardTitle>
          <Link href="/transacoes" className="text-xs font-medium text-primary">
            ver todos
          </Link>
        </div>
        <ul className="flex flex-col divide-y divide-border">
          {data.recentTransactions.length === 0 && (
            <li className="py-3 text-sm text-foreground-muted">Nenhum lançamento este mês ainda.</li>
          )}
          {data.recentTransactions.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-base font-medium">{t.description || t.category?.name || "Lançamento"}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-foreground-muted/80">
                  {formatDate(t.occurredAt)} · {t.category?.name ?? "Sem categoria"}
                  {t.emotionLog && (
                    <span title={EMOTION_LABELS[t.emotionLog.emotion as Emotion]}>
                      {EMOTION_EMOJI[t.emotionLog.emotion as Emotion]}
                    </span>
                  )}
                  {t.isImpulse && <Badge tone="warm">possível impulso</Badge>}
                </p>
              </div>
              <span
                className={`shrink-0 tabular-nums text-base font-semibold ${t.type === "receita" ? "text-primary" : ""}`}
              >
                {t.type === "receita" ? "+" : "-"} {formatCurrency(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
