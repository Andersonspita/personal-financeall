"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { wishlistItemInputSchema } from "@/lib/validation";
import { fieldErrorsFromZod, logAppError, type FormActionState } from "@/lib/errors";

/** Trava de Resfriamento (RF06): cria o item já com a data em que a confirmação será liberada. */
export async function createWishlistItem(input: unknown) {
  const user = await requireUser();
  const data = wishlistItemInputSchema.parse(input);
  const availableAt = new Date(Date.now() + data.cooldownHours * 60 * 60 * 1000);

  const item = await prisma.wishlistItem.create({
    data: { ...data, userId: user.id, availableAt },
  });
  revalidatePath("/desejos");
  return item;
}

export async function createWishlistItemFromForm(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const categoryId = String(formData.get("categoryId") ?? "");
  const parsed = wishlistItemInputSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    amount: Number(formData.get("amount")),
    categoryId: categoryId || undefined,
    cooldownHours: Number(formData.get("cooldownHours")),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revise os campos e tente de novo.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  try {
    await createWishlistItem(parsed.data);
  } catch (err) {
    logAppError("wishlist.create", err);
    return { error: "Não foi possível guardar o item. Tente de novo em instantes." };
  }
  return { success: true };
}

/** Só permite confirmar "necessidade real" depois que o prazo de resfriamento passou. */
export async function confirmWishlistItem(id: string) {
  const user = await requireUser();
  const item = await prisma.wishlistItem.findFirstOrThrow({ where: { id, userId: user.id } });
  if (item.availableAt.getTime() > Date.now()) {
    throw new Error("O período de resfriamento ainda não terminou.");
  }
  await prisma.wishlistItem.update({
    where: { id },
    data: { status: "confirmado", resolvedAt: new Date() },
  });
  revalidatePath("/desejos");
}

export async function discardWishlistItem(id: string) {
  const user = await requireUser();
  await prisma.wishlistItem.updateMany({
    where: { id, userId: user.id },
    data: { status: "descartado", resolvedAt: new Date() },
  });
  revalidatePath("/desejos");
}
