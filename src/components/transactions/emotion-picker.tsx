"use client";

import { clsx } from "clsx";
import { EMOTIONS, EMOTION_EMOJI, EMOTION_LABELS, type Emotion } from "@/lib/emotions";

export function EmotionPicker({
  value,
  onChange,
}: {
  value: Emotion | null;
  onChange: (emotion: Emotion | null) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {EMOTIONS.map((emotion) => {
        const active = value === emotion;
        return (
          <button
            key={emotion}
            type="button"
            onClick={() => onChange(active ? null : emotion)}
            className={clsx(
              "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-colors",
              active ? "border-primary bg-primary-soft" : "border-border hover:bg-surface-muted",
            )}
          >
            <span className="text-xl">{EMOTION_EMOJI[emotion]}</span>
            <span className="text-[11px] leading-tight text-foreground-muted">{EMOTION_LABELS[emotion]}</span>
          </button>
        );
      })}
    </div>
  );
}
