import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-xl font-semibold text-primary">Bússola Financeira</h1>
        <p className="mb-6 text-center text-sm text-foreground-muted">Escolha uma senha nova.</p>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
