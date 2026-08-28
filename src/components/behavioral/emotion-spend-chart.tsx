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
          <CartesianGrid stroke="color-mix(in srgb, var(--foreground) 7%, transparent)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }} stroke="transparent" tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
            stroke="transparent"
            tickLine={false}
            axisLine={false}
            width={44}
            tickCount={4}
            tickFormatter={(v: number) => formatCurrency(v).replace(",00", "")}
          />
          <Tooltip
            formatter={(value, name) => (name === "total" ? formatCurrency(Number(value)) : value)}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
