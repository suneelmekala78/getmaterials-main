"use client";

interface OtpCodeInputProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
}

/** Six equal boxes that scale with the form. One real input so SMS autofill works. */
export function OtpCodeInput({
  value,
  onChange,
  disabled,
  autoFocus,
  id,
}: OtpCodeInputProps) {
  const digits = value.replace(/\D/g, "").slice(0, 6);

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        value={digits}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        aria-label="6-digit verification code"
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
      />
      <div className="flex gap-1.5 sm:gap-2" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => {
          const filled = Boolean(digits[index]);
          const active = !disabled && digits.length === index;
          return (
            <div
              key={index}
              className={`flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border text-lg font-semibold font-mono transition ${
                active
                  ? "border-[var(--primary)] bg-white shadow-[0_0_0_4px_rgba(177,0,255,0.1)]"
                  : filled
                    ? "border-slate-300 bg-white text-slate-900"
                    : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {digits[index] ?? ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
