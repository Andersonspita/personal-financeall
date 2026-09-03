import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getEmotionSpendMatrix, getConsecutiveCriticalStreak, CRITICAL_STREAK_THRESHOLD } from "@/lib/insights";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { EmotionSpendChart } from "@/components/behavioral/emotion-spend-chart";
import { SupportChannels } from "@/components/support-channels";
import { EMOTION_EMOJI, EMOTION_LABELS, type Emotion } from "@/lib/emotions";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CorrelationPage() {
  const user = await requireUser();
  const [matrix, criticalStreak] = await Promise.all([
    getEmotionSpendMatrix(user.id, 30),
    getConsecutiveCriticalStreak(user.id),
  ]);

  const chartData = matrix
    .filter((m) => m.count > 0)
    .map((m) => ({ emotion: m.emotion, label: `${EMOTION_EMOJI[m.emotion]} ${EMOTION_LABELS[m.emotion]}`, total: m.total, count: m.count }));

  const top = chartData[0];

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-4">
      <PageHeader
        title="Emoção × gasto"
        subtitle="Últimos 30 dias. Nenhum sentimento é “errado” — a ideia é só enxergar padrões, sem julgamento."
      />

      {criticalStreak >= CRITICAL_STREAK_THRESHOLD && <SupportChannels />}

      {top && (
        <Card>
          <CardTitle>Maior drenagem de caixa</CardTitle>
          <p className="text-2xl font-semibold">
            {EMOTION_EMOJI[top.emotion as Emotion]} {EMOTION_LABELS[top.emotion as Emotion]}
          </p>
          <p className="text-sm text-foreground-muted">
            {formatCurrency(top.total)} em {top.count} compra(s)
          </p>
          <Link href="/aprender" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary">
            <BookOpen size={15} /> Ver os cursos sobre isso
          </Link>
        </Card>
      )}

      <Card>
        <CardTitle>Total gasto por emoção</CardTitle>
        {chartData.length > 0 ? (
          <EmotionSpendChart data={chartData} />
        ) : (
          <p className="text-sm text-foreground-muted">
            Ainda não há lançamentos com estado emocional registrado nos últimos 30 dias.
          </p>
        )}
      </Card>
    </div>
  );
}
