import { Card, CardTitle } from "@/components/ui/card";
import { SUPPORT_CHANNELS, VULNERABILITY_LEVEL_COPY } from "@/lib/copy";

export function SupportChannels() {
  return (
    <Card className="border-critical/30 bg-critical-soft">
      <CardTitle className="text-critical">Um convite para pedir apoio</CardTitle>
      <p className="mb-3 text-sm">{VULNERABILITY_LEVEL_COPY.critico}</p>
      <div className="flex flex-col gap-2">
        {SUPPORT_CHANNELS.map((c) => (
          <div key={c.name} className="rounded-lg bg-surface p-3 text-sm">
            <p className="font-medium">{c.name}</p>
            <p className="text-foreground-muted">{c.description}</p>
            <p className="mt-0.5 font-medium text-primary">{c.contact}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
