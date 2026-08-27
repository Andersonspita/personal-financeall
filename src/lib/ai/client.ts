import "server-only";
import OpenAI from "openai";

// Escopo estreito de propósito (ver src/lib/ai/prompts.ts): este assistente não é um chat aberto
// de desabafo. Ele só explica o score de vulnerabilidade e sugere perguntas de reflexão na trava
// de resfriamento — nunca substitui os canais de apoio profissional já indicados em RF09.

export const DEFAULT_MODEL = "gpt-4o-mini";

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

let client: OpenAI | undefined;

export function getAiClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export function getAiModel(): string {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}
