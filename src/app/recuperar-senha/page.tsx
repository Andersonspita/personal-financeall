import { RequestResetForm } from "@/components/auth/request-reset-form";

export default function RequestResetPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-xl font-semibold text-primary">Bússola Financeira</h1>
        <p className="mb-6 text-center text-sm text-foreground-muted">
          Informe o e-mail da conta. Se ele existir, enviamos um link para definir uma nova senha.
        </p>
        <RequestResetForm />
      </div>
    </div>
  );
}
