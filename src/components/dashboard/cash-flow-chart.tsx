"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

interface Point {
  day: number;
  saldoReal: number | null;
  saldoProjetado: number | null;
}

function paddedDomain([dataMin, dataMax]: readonly [number, number]): [number, number] {
  const min = Number.isFinite(dataMin) ? dataMin : 0;
  const max = Number.isFinite(dataMax) ? dataMax : 0;
  const span = Math.max(max - min, 200);
  const pad = span * 0.18;
  return [min - pad, max + pad];
}

export function CashFlowChart({ data }: { data: Point[] }) {
  return (
    <div className="mt-2 h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="color-mix(in srgb, var(--foreground) 7%, transparent)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
            stroke="transparent"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
            stroke="transparent"
            tickLine={false}
            axisLine={false}
            width={44}
            tickCount={4}
            domain={paddedDomain}
            tickFormatter={(v: number) => formatCompactCurrency(v)}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(day) => `Dia ${day}`}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="saldoReal"
            name="Saldo"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="saldoProjetado"
            name="Projeção"
            stroke="var(--color-calm)"
            strokeWidth={2}
            strokeDasharray="6 5"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
