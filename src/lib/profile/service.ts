import "server-only";
import { prisma } from "@/lib/prisma";
import { behavioralProfileInputSchema, type BehavioralProfileInput } from "@/lib/profile/schemas";
import type { OnboardingStatus } from "@/lib/profile/constants";

export async function getBehavioralProfile(userId: string) {
  return prisma.behavioralProfile.findUnique({ where: { userId } });
}

export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { onboardingStatus: true },
  });
  return user.onboardingStatus as OnboardingStatus;
}

export async function skipOnboarding(userId: string) {
  const now = new Date();
  await prisma.$transaction([
    prisma.behavioralProfile.upsert({
      where: { userId },
      create: { userId, skippedAt: now },
      update: { skippedAt: now },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { onboardingStatus: "skipped" },
    }),
  ]);
}

export async function completeOnboarding(userId: string, input: unknown) {
  const data = behavioralProfileInputSchema.parse(input) satisfies BehavioralProfileInput;
  const now = new Date();

  await prisma.$transaction([
    prisma.behavioralProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
        completedAt: now,
        skippedAt: null,
      },
      update: {
        ...data,
        completedAt: now,
        skippedAt: null,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { onboardingStatus: "completed" },
    }),
  ]);
}

export async function updateBehavioralProfile(userId: string, input: unknown) {
  const data = behavioralProfileInputSchema.parse(input);
  const now = new Date();

  await prisma.behavioralProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
      completedAt: now,
    },
    update: {
      ...data,
      completedAt: now,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { onboardingStatus: "completed" },
  });
}

/** Padrão da trava de resfriamento: perfil do usuário ou 48h. */
export async function getDefaultCooldownHours(userId: string): Promise<number> {
  const profile = await getBehavioralProfile(userId);
  const hours = profile?.cooldownHours;
  if (hours === 24 || hours === 48 || hours === 72) return hours;
  return 48;
}
