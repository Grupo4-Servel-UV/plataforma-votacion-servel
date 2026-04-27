import { useRef, useState, useEffect } from "react";

interface Props {
  length?: number;
  onComplete?: (code: string) => void;
  error?: boolean;
}

export function OTPInput({ length = 6, onComplete, error }: Props) {
  const [vals, setVals] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (error) setVals(Array(length).fill(""));
  }, [error, length]);

  const update = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...vals];
    next[i] = digit;
    setVals(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every((x) => x) && next.join("").length === length) {
      onComplete?.(next.join(""));
    }
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !vals[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(length).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setVals(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  };

  return (
    <div className="flex justify-center gap-2" onPaste={onPaste}>
      {vals.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={(e) => update(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          className={`h-14 w-12 rounded-lg border-2 bg-card text-center text-2xl font-bold tabular-nums outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15 ${
            error
              ? "border-destructive animate-shake"
              : v
              ? "border-primary/60"
              : "border-border"
          }`}
        />
      ))}
    </div>
  );
}
