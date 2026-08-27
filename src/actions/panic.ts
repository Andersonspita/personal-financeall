"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { panicSessionInputSchema } from "@/lib/validation";

/** Botão de Pânico / Desvio de Foco (RF08). Sessão simples, sem julgamento no desfecho. */
export async function startPanicSession(input: unknown) {
  const user = await requireUser();
  const data = panicSessionInputSchema.parse(input);
  const session = await prisma.panicSession.create({ data: { ...data, userId: user.id } });
  return session;
}

export async function completePanicSession(
  id: string,
  outcome: "evitou_compra" | "comprou_mesmo",
  activityId?: string,
) {
  const user = await requireUser();
  await prisma.panicSession.updateMany({
    where: { id, userId: user.id },
    data: { completedAt: new Date(), outcome, activityId },
  });
  revalidatePath("/panico");
}
