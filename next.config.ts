import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pacotes com bindings nativos (.node): deixar o Next.js bundlar essas libs no build do
  // servidor quebra a resolução da plataforma correta em runtime (visto no Windows com
  // @gorules/zen-engine). Mantê-las como dependências externas reais resolve isso.
  serverExternalPackages: ["@gorules/zen-engine", "better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
