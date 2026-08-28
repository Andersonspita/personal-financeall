import { LoginForm } from "@/components/auth/login-form";
import { isGoogleAuthConfigured } from "@/lib/auth/config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-xl font-semibold text-primary">Bússola Financeira</h1>
        <p className="mb-6 text-center text-sm text-foreground-muted">Bom te ver de novo.</p>
        <LoginForm googleEnabled={isGoogleAuthConfigured()} oauthError={error} />
      </div>
    </div>
  );
}
