import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { getDashboardData, type DashboardData } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getBehavioralProfile } from "@/lib/profile/service";
import { getTodayMoodLog } from "@/lib/mood/service";
import { dashboardProfileHint } from "@/lib/profile/copy";
import type { ProfileTrigger } from "@/lib/profile/constants";
import type { DailyMood } from "@/lib/mood/constants";
import { VulnerabilityExplainerButton } from "@/components/ai/vulnerability-explainer-button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { DailyMoodCheckIn } from "@/components/dashboard/daily-mood-check-in";
import { MoodTimelineChart } from "@/components/dashboard/mood-timeline-chart";
import { EmotionSpendChart } from "@/components/behavioral/emotion-spend-chart";
import { VulnerabilityBadge } from "@/components/vulnerability-badge";
import { BUDGET_ALERT_COPY } from "@/lib/copy";
import { formatCurrency, formatDate } from "@/lib/format";
import { EMOTION_EMOJI, EMOTION_LABELS, type Emotion } from "@/lib/emotions";
import { NudgeBanner } from "@/components/nudge-banner";
import { buttonClass } from "@/components/ui/control";

type DashboardBudget = DashboardData["budgetsWithSpent"][number];
type DashboardTransaction = DashboardData["recentTransactions"][number];

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser();
  const { month } = await searchParams;
  const [data, dbUser, profile, todayMood] = await Promise.all([
    getDashboardData(user.id, month),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { aiAssistantEnabled: true } }),
    getBehavioralProfile(user.id),
    getTodayMoodLog(user.id),
  ]);
  const profileHint = dashboardProfileHint(profile?.typicalTrigger as ProfileTrigger | undefined);
  const hasEmotionData = data.recentTransactions.some(
    (transaction: DashboardTransaction) => transaction.emotionLog,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Visão geral</h1>
        <Link href="/transacoes/novo" className={buttonClass("primary", "px-4 py-2")}>
          <Plus size={16} /> Lançar
        </Link>
      </div>

      <MonthSelector monthKey={data.period.key} label={data.period.label} isCurrent={data.period.isCurrent} />

      {data.openNudge && <NudgeBanner id={data.openNudge.id} message={data.openNudge.message} />}

      <DailyMoodCheckIn
        initialMood={(todayMood?.mood as DailyMood | undefined) ?? null}
        disabled={!data.period.isCurrent}
      />

      <Card>
        <CardTitle>{data.period.isCurrent ? "Saldo disponível" : "Resultado do mês"}</CardTitle>
        <p className="text-3xl font-semibold tabular-nums">
          {formatCurrency(data.period.isCurrent ? data.saldoDisponivel : data.resultadoMes)}
        </p>
        {data.period.isCurrent ? (
          <p className="mt-1 text-xs text-foreground-muted">Todas as contas, até agora.</p>
        ) : (
          <p className="mt-1 text-xs text-foreground-muted">
            Receitas − despesas em {data.period.label}. Saldo no último dia com movimento:{" "}
            {formatCurrency(data.saldoFimMes)}.
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-foreground-muted">Receitas (mês)</p>
            <p className="font-medium tabular-nums">{formatCurrency(data.receitasMes)}</p>
          </div>
          <div>
            <p className="text-foreground-muted">Despesas (mês)</p>
            <p className="font-medium tabular-nums">{formatCurrency(data.despesasMes)}</p>
          </div>
          <div>
            <p className="text-foreground-muted">Fixas</p>
            <p className="font-medium tabular-nums">{formatCurrency(data.despesasFixas)}</p>
          </div>
          <div>
            <p className="text-foreground-muted">Variáveis</p>
            <p className="font-medium tabular-nums">{formatCurrency(data.despesasVariaveis)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle className="mb-0">Fluxo do mês (dados reais)</CardTitle>
          <span className="text-sm font-medium tabular-nums text-foreground-muted">
            {formatCurrency(data.saldoFimMes)}
          </span>
        </div>
        <p className="mb-2 text-xs text-foreground-muted">
          Saldo acumulado dia a dia com base nos lançamentos — sem projeção de gastos futuros.
        </p>
        <CashFlowChart data={data.chartData} />
      </Card>

      <Card>
        <CardTitle>Gasto por emoção</CardTitle>
        <p className="mb-3 text-xs text-foreground-muted">
          Despesas com estado emocional registrado em {data.period.label}.
        </p>
        {data.emotionChartData.length > 0 ? (
          <EmotionSpendChart data={data.emotionChartData} />
        ) : (
          <p className="text-sm text-foreground-muted">
            Ainda não há lançamentos com emoção neste mês. Ao registrar despesas, marque como você estava.
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>Humor ao longo do mês</CardTitle>
        <p className="mb-3 text-xs text-foreground-muted">Check-ins diários — como você acordou ou está.</p>
        <MoodTimelineChart data={data.moodTimeline} />
      </Card>

      <Card>
        <CardTitle>Como você está</CardTitle>
        <VulnerabilityBadge level={data.vulnerability.level} />
        <p className="mt-2 text-xs text-foreground-muted">Baseado nos últimos 7 dias de gasto — não é diagnóstico.</p>
        {profileHint && !hasEmotionData && data.period.isCurrent && (
          <p className="mt-3 text-sm text-foreground-muted">{profileHint}</p>
        )}
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
            {data.budgetsWithSpent.slice(0, 4).map((budget: DashboardBudget) => (
              <div key={budget.id} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">
                    {budget.category.icon} {budget.category.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-sm text-foreground-muted">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limitAmount)}
                  </span>
                </div>
                <ProgressBar ratio={budget.limitAmount > 0 ? budget.spent / budget.limitAmount : 0} tone={budget.alertLevel} />
                {budget.alertLevel !== "dentro_do_limite" && (
                  <p className="mt-1 text-xs text-foreground-muted">
                    {budget.alertLevel === "alerta_80"
                      ? BUDGET_ALERT_COPY.at80(budget.category.name)
                      : BUDGET_ALERT_COPY.at100(budget.category.name)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle className="mb-0">Lançamentos do mês</CardTitle>
          <Link href="/transacoes" className="text-xs font-medium text-primary">
            ver todos
          </Link>
        </div>
        <ul className="flex flex-col divide-y divide-border">
          {data.recentTransactions.length === 0 && (
            <li className="py-3 text-sm text-foreground-muted">Nenhum lançamento neste mês ainda.</li>
          )}
          {data.recentTransactions.map((transaction: DashboardTransaction) => (
            <li key={transaction.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-base font-medium">
                  {transaction.description || transaction.category?.name || "Lançamento"}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-foreground-muted/80">
                  {formatDate(transaction.occurredAt)} · {transaction.category?.name ?? "Sem categoria"}
                  {transaction.emotionLog && (
                    <span title={EMOTION_LABELS[transaction.emotionLog.emotion as Emotion]}>
                      {EMOTION_EMOJI[transaction.emotionLog.emotion as Emotion]}
                    </span>
                  )}
                  {transaction.isImpulse && <Badge tone="warm">possível impulso</Badge>}
                </p>
              </div>
              <span
                className={`shrink-0 tabular-nums text-base font-semibold ${transaction.type === "receita" ? "text-primary" : ""}`}
              >
                {transaction.type === "receita" ? "+" : "-"} {formatCurrency(transaction.amount)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
