import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";

const PUBLIC_PAGE_PATHS = ["/login", "/registrar"];
const PUBLIC_API_PATHS = ["/api/auth/login", "/api/auth/register"];

async function getToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice("Bearer ".length);
  return request.cookies.get("session")?.value ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPage = PUBLIC_PAGE_PATHS.includes(pathname);
  const isPublicApi = PUBLIC_API_PATHS.includes(pathname);

  const token = await getToken(request);
  const session = token ? await verifySessionToken(token) : null;

  if (isPublicApi) return NextResponse.next();

  if (isPublicPage) {
    // Usuário já logado não precisa ver a tela de login/registro de novo.
    if (session) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icon.svg|sw.js).*)"],
};
