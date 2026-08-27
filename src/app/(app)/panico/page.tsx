import { PanicFlow } from "@/components/panic/panic-flow";

export default function PanicPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Botão de Pânico</h1>
      <PanicFlow />
    </div>
  );
}
