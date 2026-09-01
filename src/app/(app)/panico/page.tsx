import { PanicFlow } from "@/components/panic/panic-flow";
import { PageHeader } from "@/components/ui/page-header";

export default function PanicPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Pausa agora" subtitle="Um desvio de foco, sem julgamento e sem conta." />
      <PanicFlow />
    </div>
  );
}
