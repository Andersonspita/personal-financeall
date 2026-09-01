"use client";

type Option = { value: string; label: string };

export function OptionCards({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby={`${name}-legend`}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
              selected ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/40"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="mt-1 accent-primary"
            />
            <span className="text-sm leading-snug">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
