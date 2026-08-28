export function appBaseUrl(requestUrl?: string): string {
  const configured = process.env.APP_BASE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  if (requestUrl) {
    const url = new URL(requestUrl);
    return `${url.protocol}//${url.host}`;
  }
  return "http://localhost:3000";
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}
