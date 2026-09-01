import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthShell subtitle="Escolha uma senha nova.">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
