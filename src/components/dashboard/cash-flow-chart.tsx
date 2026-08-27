"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";

interface Point {
  day: number;
  saldoReal: number | null;
  saldoProjetado: number | null;
}

export function CashFlowChart({ data }: { data: Point[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-foreground-muted)" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="var(--color-foreground-muted)"
            width={56}
            tickFormatter={(v: number) => formatCurrency(v).replace(",00", "")}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(day) => `Dia ${day}`}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
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
          />
          <Line
            type="monotone"
            dataKey="saldoProjetado"
            name="Projeção"
            stroke="var(--color-calm)"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
