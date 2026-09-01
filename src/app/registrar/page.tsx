import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { isGoogleAuthConfigured } from "@/lib/auth/config";

export default function RegisterPage() {
  return (
    <AuthShell subtitle="Um espaço seu para organizar finanças com mais gentileza.">
      <RegisterForm googleEnabled={isGoogleAuthConfigured()} />
    </AuthShell>
  );
}
