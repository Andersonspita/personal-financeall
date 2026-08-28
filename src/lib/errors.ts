import { z } from "zod";

/** Erro de regra de negócio seguro para mostrar na UI (não vaza detalhes de Prisma/infra). */
export class DomainError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "DomainError";
    this.field = field;
  }
}

export type FormFieldErrors = Record<string, string>;

export type FormActionState = {
  error?: string;
  fieldErrors?: FormFieldErrors;
  success?: boolean;
};

export function fieldErrorsFromZod(error: z.ZodError): FormFieldErrors {
  const fields: FormFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

export function logAppInfo(scope: string, extra?: Record<string, unknown>): void {
  console.info(
    JSON.stringify({
      level: "info",
      scope,
      ...extra,
      at: new Date().toISOString(),
    }),
  );
}

export function logAppError(scope: string, err: unknown, extra?: Record<string, unknown>): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(
    JSON.stringify({
      level: "error",
      scope,
      message,
      ...extra,
      at: new Date().toISOString(),
    }),
  );
}

export function userMessageFromUnknown(err: unknown, fallback: string): string {
  if (err instanceof DomainError) return err.message;
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? fallback;
  logAppError("unhandled", err);
  return fallback;
}
