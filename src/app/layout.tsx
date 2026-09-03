import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope, Geist_Mono } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

// Manrope: geometria aberta e altura-x alta — legibilidade numérica objetiva com calor humano.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Desafoga! — Finanças com autocompaixão",
  description: "Finanças pessoais com apoio emocional e detecção de compulsão por compras.",
  manifest: "/manifest.json",
  icons: [{ rel: "icon", url: "/icon.svg", type: "image/svg+xml" }],
};

export const viewport: Viewport = {
  themeColor: "#2d6a4f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Layout raiz: só o essencial (fontes, tema, PWA). A navegação autenticada vive em
// src/app/(app)/layout.tsx — login/registro não devem mostrar a barra de navegação do app.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
