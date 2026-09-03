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
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PageHeader } from "@/components/ui/page-header";
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

  const firstName = user.name.split(" ")[0];

  const metrics = [
    { label: "Receitas", value: data.receitasMes },
    { label: "Despesas", value: data.despesasMes },
    { label: "Fixas", value: data.despesasFixas },
    { label: "Variáveis", value: data.despesasVariaveis },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={`Olá, ${firstName}`}
        eyebrow="Espaço de acolhimento financeiro"
        subtitle={
          data.period.isCurrent
            ? "Seu mês até agora — sem julgamento, apenas clareza sobre o que você sente e gasta."
            : data.period.label
        }
        trailing={
          // No mobile o FAB da barra inferior já cobre esta ação.
          <span className="hidden md:inline-flex">
            <Link href="/transacoes/novo" className={buttonClass("primary")}>
              <Plus size={16} /> Lançar
            </Link>
          </span>
        }
      />

      <MonthSelector monthKey={data.period.key} label={data.period.label} isCurrent={data.period.isCurrent} />

      {data.openNudge && <NudgeBanner id={data.openNudge.id} message={data.openNudge.message} />}

      {/* Faixa de métricas: saldo em destaque sálvia + quatro cartões tonais de respiro. */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-2xl bg-primary px-6 py-7 text-on-primary shadow-lifted lg:col-span-5">
          <p className="text-sm font-medium text-on-primary/75">
            {data.period.isCurrent ? "Saldo disponível" : "Resultado do mês"}
          </p>
          <p className="mt-2 text-[2.4rem] font-bold leading-none tracking-tight tabular-nums">
            {formatCurrency(data.period.isCurrent ? data.saldoDisponivel : data.resultadoMes)}
          </p>
          {data.period.isCurrent ? (
            <p className="mt-3 text-sm leading-5 text-on-primary/70">
              Todas as contas, até agora. Este número não define seu valor pessoal.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-5 text-on-primary/70">
              Receitas − despesas em {data.period.label}. Saldo no último dia: {formatCurrency(data.saldoFimMes)}.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-7">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-border/80 bg-surface p-4 shadow-soft transition-[box-shadow,transform] duration-[250ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-foreground-muted">
                {metric.label}
              </p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-foreground">{formatCurrency(metric.value)}</p>
            </div>
          ))}
        </div>
      </section>

      <DailyMoodCheckIn
        initialMood={(todayMood?.mood as DailyMood | undefined) ?? null}
        disabled={!data.period.isCurrent}
      />

      {/* Fluxo reflexivo (7 col) + painel de insights comportamentais (5 col). */}
      <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <Card>
            <div className="mb-1 flex items-center justify-between gap-3">
              <CardTitle className="mb-0">Fluxo do mês</CardTitle>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground-muted">
                {formatCurrency(data.saldoFimMes)}
              </span>
            </div>
            <CardSubtitle>
              Saldo acumulado dia a dia com base nos lançamentos — sem projeção de gastos futuros.
            </CardSubtitle>
            <CashFlowChart data={data.chartData} />
          </Card>

          <Card>
            <CardTitle>Gasto por emoção</CardTitle>
            <CardSubtitle>Despesas com estado emocional registrado em {data.period.label}.</CardSubtitle>
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
            <CardSubtitle>Check-ins diários — como você acordou ou está.</CardSubtitle>
            <MoodTimelineChart data={data.moodTimeline} />
          </Card>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <Card tone="sage">
            <CardTitle>Como você está</CardTitle>
            <VulnerabilityBadge level={data.vulnerability.level} />
            <p className="mt-2 text-sm text-foreground-muted">
              Baseado nos últimos 7 dias de gasto — não é diagnóstico.
            </p>
            {profileHint && !hasEmotionData && data.period.isCurrent && (
              <p className="mt-3 text-sm text-foreground-muted">{profileHint}</p>
            )}
            <Link href="/aprender" className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary">
              <BookOpen size={15} /> Ver os cursos
            </Link>
            <VulnerabilityExplainerButton aiEnabled={dbUser.aiAssistantEnabled} />
          </Card>

          {data.budgetsWithSpent.length > 0 && (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-3">
                <CardTitle className="mb-0">Orçamentos do mês</CardTitle>
                <Link href="/orcamentos" className="shrink-0 text-xs font-semibold text-primary">
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
                    <ProgressBar
                      ratio={budget.limitAmount > 0 ? budget.spent / budget.limitAmount : 0}
                      tone={budget.alertLevel}
                    />
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
            <div className="mb-3 flex items-center justify-between gap-3">
              <CardTitle className="mb-0">Lançamentos do mês</CardTitle>
              <Link href="/transacoes" className="shrink-0 text-xs font-semibold text-primary">
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
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
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
      </div>
    </div>
  );
}
