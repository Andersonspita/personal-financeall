import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { isGoogleAuthConfigured } from "@/lib/auth/config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthShell subtitle="Bom te ver de novo.">
      <LoginForm googleEnabled={isGoogleAuthConfigured()} oauthError={error} />
    </AuthShell>
  );
}
