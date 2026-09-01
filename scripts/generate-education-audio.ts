/**
 * Gera MP3 de narração para cada curso e aula (voz sintética pt-BR).
 *
 * Usa OPENAI_API_KEY (tts-1) se disponível; senão Microsoft Edge TTS (grátis).
 *
 * Uso: npm run videos:generate
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import OpenAI from "openai";
import { COURSE_VIDEO_SCRIPTS, LESSON_VIDEO_SCRIPTS } from "../src/lib/education/video-scripts";

config();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "audio", "education");
const voiceEdge = "pt-BR-FranciscaNeural";
const voiceOpenAi = "nova";

mkdirSync(outDir, { recursive: true });

async function synthesizeWithOpenAi(text: string): Promise<Buffer> {
  const openai = new OpenAI();
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: voiceOpenAi,
    input: text,
    response_format: "mp3",
  });
  return Buffer.from(await response.arrayBuffer());
}

async function synthesizeWithEdge(text: string): Promise<Buffer> {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import("edge-tts-node");
  const tts = new MsEdgeTTS({});
  await tts.setMetadata(voiceEdge, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const readable = tts.toStream(text);
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function synthesize(text: string): Promise<Buffer> {
  if (process.env.OPENAI_API_KEY?.trim()) {
    console.log("  → OpenAI TTS");
    return synthesizeWithOpenAi(text);
  }
  console.log("  → Edge TTS (pt-BR)");
  return synthesizeWithEdge(text);
}

async function generateOne(slug: string, narration: string) {
  const target = join(outDir, `${slug}.mp3`);
  console.log(`Gerando ${slug}.mp3 …`);
  const audio = await synthesize(narration);
  writeFileSync(target, audio);
  console.log(`  ✓ ${(audio.length / 1024).toFixed(0)} KB`);
}

const scripts = new Map<string, string>();
for (const [slug, script] of Object.entries(COURSE_VIDEO_SCRIPTS)) {
  scripts.set(slug, script.narration);
}
for (const [slug, script] of Object.entries(LESSON_VIDEO_SCRIPTS)) {
  scripts.set(slug, script.narration);
}

console.log(`Gerando ${scripts.size} arquivos em public/audio/education/ …\n`);

async function main() {
  for (const [slug, narration] of scripts) {
    await generateOne(slug, narration);
  }
  console.log("\nConcluído.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
