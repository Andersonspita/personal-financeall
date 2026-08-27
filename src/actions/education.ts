"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

export async function markContentViewed(contentId: string) {
  const user = await requireUser();
  await prisma.contentProgress.upsert({
    where: { userId_contentId: { userId: user.id, contentId } },
    update: { viewedAt: new Date() },
    create: { userId: user.id, contentId, viewedAt: new Date() },
  });
}

export async function markContentCompleted(contentId: string) {
  const user = await requireUser();
  await prisma.contentProgress.upsert({
    where: { userId_contentId: { userId: user.id, contentId } },
    update: { completedAt: new Date() },
    create: { userId: user.id, contentId, viewedAt: new Date(), completedAt: new Date() },
  });
  revalidatePath("/aprender");
}
