"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { isAiConfigured } from "@/lib/ai/client";
import { explainVulnerability } from "@/lib/ai/vulnerability-explainer";
import { generateReflectionQuestion } from "@/lib/ai/reflection-question";
import { computeCurrentVulnerability } from "@/lib/insights";
import { AiUnavailableError } from "@/lib/ai/errors";

async function assertAiReady(userId: string) {
  if (!isAiConfigured()) {
    throw new AiUnavailableError("O assistente de IA ainda não foi configurado neste servidor.");
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.aiAssistantEnabled) {
    throw new AiUnavailableError("Ative o assistente de IA em Configurações para usar esse recurso.");
  }
}

export async function updateAiAssistantSetting(enabled: boolean) {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { aiAssistantEnabled: enabled } });
  revalidatePath("/configuracoes");
  revalidatePath("/");
  revalidatePath("/desejos");
}

export async function getAiVulnerabilityExplanation(): Promise<string> {
  const user = await requireUser();
  await assertAiReady(user.id);
  const assessment = await computeCurrentVulnerability(user.id);
  return explainVulnerability(assessment);
}

export async function getAiReflectionQuestion(wishlistItemId: string): Promise<string> {
  const user = await requireUser();
  await assertAiReady(user.id);

  const item = await prisma.wishlistItem.findFirst({
    where: { id: wishlistItemId, userId: user.id },
    include: { category: true },
  });
  if (!item) throw new Error("Item de desejo não encontrado.");

  return generateReflectionQuestion({
    name: item.name,
    amount: item.amount,
    categoryName: item.category?.name,
  });
}
