"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";

interface Row {
  emotion: string;
  label: string;
  total: number;
  count: number;
}

export function EmotionSpendChart({ data }: { data: Row[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-foreground-muted)" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="var(--color-foreground-muted)"
            width={56}
            tickFormatter={(v: number) => formatCurrency(v).replace(",00", "")}
          />
          <Tooltip
            formatter={(value, name) => (name === "total" ? formatCurrency(Number(value)) : value)}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
