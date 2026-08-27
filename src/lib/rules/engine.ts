import { ZenEngine } from "@gorules/zen-engine";
import { readFileSync } from "fs";
import path from "path";
import type { VulnerabilityLevel } from "@/lib/vulnerability";

// Motor de regras (RF09): o mapeamento score -> nível de vulnerabilidade fica em um JDM
// (decision table) editável sem precisar mexer no código — ver ./vulnerability-level.json.
// A engine e a decisão compilada são reutilizadas entre chamadas (custo de parse pago uma vez só).

let engine: ZenEngine | undefined;
let vulnerabilityDecision: ReturnType<ZenEngine["createDecision"]> | undefined;

function getEngine(): ZenEngine {
  if (!engine) {
    engine = new ZenEngine();
  }
  return engine;
}

function getVulnerabilityDecision() {
  if (!vulnerabilityDecision) {
    const content = readFileSync(path.join(process.cwd(), "src/lib/rules/vulnerability-level.json"));
    vulnerabilityDecision = getEngine().createDecision(content);
  }
  return vulnerabilityDecision;
}

export async function scoreToLevel(score: number): Promise<VulnerabilityLevel> {
  const result = await getVulnerabilityDecision().evaluate({ score });
  return result.result.level as VulnerabilityLevel;
}
