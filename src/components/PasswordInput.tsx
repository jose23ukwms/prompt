"use client";

import { useState } from "react";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Masukkan password",
  error,
  showStrength = false,
  autoComplete = "new-password",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  showStrength?: boolean;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  const strength = (() => {
    if (!showStrength || !value) return null;
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    if (score <= 1) return { label: "Lemah", tone: "bg-rose-500", text: "text-rose-300", bars: 1 };
    if (score <= 2) return { label: "Cukup", tone: "bg-amber-500", text: "text-amber-300", bars: 2 };
    if (score <= 3) return { label: "Bagus", tone: "bg-lime-500", text: "text-lime-300", bars: 3 };
    if (score <= 4) return { label: "Kuat", tone: "bg-emerald-500", text: "text-emerald-300", bars: 4 };
    return { label: "Sangat Kuat", tone: "bg-emerald-400", text: "text-emerald-200", bars: 5 };
  })();

  return (
    <div>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border ${
            error ? "border-rose-400" : "border-white/10"
          } bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}

      {showStrength && value && strength && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i <= strength.bars ? strength.tone : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className={`mt-1 text-[11px] ${strength.text}`}>Kekuatan: {strength.label}</p>
        </div>
      )}
    </div>
  );
}
