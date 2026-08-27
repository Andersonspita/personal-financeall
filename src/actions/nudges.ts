"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

export async function dismissNudge(id: string) {
  const user = await requireUser();
  await prisma.nudge.updateMany({ where: { id, userId: user.id }, data: { dismissedAt: new Date() } });
  revalidatePath("/");
}

export async function markNudgeSeen(id: string) {
  const user = await requireUser();
  await prisma.nudge.updateMany({ where: { id, userId: user.id }, data: { seenAt: new Date() } });
}
