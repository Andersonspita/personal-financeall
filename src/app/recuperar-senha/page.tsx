import { RequestResetForm } from "@/components/auth/request-reset-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function RequestResetPage() {
  return (
    <AuthShell subtitle="Informe o e-mail da conta. Se ele existir, enviamos um link para definir uma nova senha.">
      <RequestResetForm />
    </AuthShell>
  );
}
