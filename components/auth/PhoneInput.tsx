"use client";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

/** Indian mobile input with fixed +91 prefix */
export function PhoneInput({ value, onChange, required, disabled }: PhoneInputProps) {
  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    onChange(digits);
  };

  return (
    <div className="mt-1 flex rounded-lg border border-gray-200 overflow-hidden focus-within:border-[var(--primary)] transition">
      <span className="inline-flex items-center px-3 bg-gray-50 text-sm font-medium text-gray-600 border-r border-gray-200">
        +91
      </span>
      <input
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="98765 43210"
        required={required}
        disabled={disabled}
        maxLength={10}
        className="flex-1 px-3 py-2.5 text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : phone;
}
