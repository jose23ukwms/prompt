"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = {
  canCopy: boolean;
  remaining: number | "unlimited";
  isPremiumUser: boolean;
  isAdmin: boolean;
  isPremiumPrompt: boolean;
  reason?: string | null;
};

export default function CopyButton({
  text,
  promptId,
  label = "Copy Prompt",
}: {
  text: string;
  promptId?: number;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<Status | null>(promptId ? null : {
    canCopy: true,
    remaining: "unlimited",
    isPremiumUser: true,
    isAdmin: false,
    isPremiumPrompt: false,
  });
  const [busy, setBusy] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!promptId) return;
    const profileEmail = localStorage.getItem("sd_user_email") || undefined;
    fetch("/api/prompts/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId, profileEmail }),
    })
      .then((r) => r.json())
      .then((data) => data?.ok !== false && setStatus(data))
      .catch(() => setError("Gagal memeriksa kuota copy."));
  }, [promptId]);

  async function handleClick() {
    if (!text || !status || busy) return;
    if (!status.canCopy) {
      setShowLimitModal(true);
      return;
    }

    setBusy(true);
    setError("");
    try {
      // Server mencatat/menyetujui copy terlebih dahulu untuk mencegah klik paralel.
      if (promptId) {
        const profileEmail = localStorage.getItem("sd_user_email") || undefined;
        const response = await fetch("/api/prompts/copy/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promptId, profileEmail }),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          setStatus({ ...status, canCopy: false, remaining: 0, reason: result.error });
          setShowLimitModal(true);
          return;
        }
      }

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      if (!status.isPremiumUser && !status.isAdmin) {
        setStatus({ ...status, canCopy: false, remaining: 0, reason: "COPY_LIMIT_REACHED" });
      }
    } catch {
      setError("Clipboard tidak tersedia. Izinkan akses clipboard pada browser.");
    } finally {
      setBusy(false);
    }
  }

  if (!status) {
    return (
      <button disabled className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-500">
        Memeriksa akses...
      </button>
    );
  }

  if (status.canCopy) {
    return (
      <div>
        <button
          onClick={handleClick}
          disabled={busy}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${copied ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90"} disabled:opacity-50`}
        >
          {busy ? "Memvalidasi..." : copied ? "✓ Tersalin!" : `📋 ${label}`}
        </button>
        {error && <p className="mt-1 text-[10px] text-rose-400">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLimitModal(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/15"
      >
        🔒 {status.reason === "TRIAL_EXPIRED" ? "Akses 7 Hari Berakhir" : `${label} (Terkunci)`}
      </button>
      {showLimitModal && <LimitModal reason={status.reason} onClose={() => setShowLimitModal(false)} />}
    </>
  );
}

function LimitModal({ reason, onClose }: { reason?: string | null; onClose: () => void }) {
  const expired = reason === "TRIAL_EXPIRED";
  const premiumRequired = reason === "PREMIUM_REQUIRED";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl">🔒</span>
          <div>
            <h3 className="text-lg font-bold text-white">
              {expired ? "Masa Akses Gratis Berakhir" : premiumRequired ? "Prompt Premium" : "Kuota Copy Prompt Habis"}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {expired
                ? "Perangkat ini telah menggunakan akses gratis selama 7 hari. Upgrade untuk melanjutkan."
                : premiumRequired
                ? "Prompt ini hanya tersedia untuk member Premium."
                : "Paket gratis hanya memberikan 1x copy untuk setiap prompt."}
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Premium Benefit</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-200">
            <li>✓ Copy tanpa batas</li>
            <li>✓ Akses setelah masa gratis berakhir</li>
            <li>✓ Prompt Troubleshooter</li>
            <li>✓ Seluruh prompt premium & workflow</li>
          </ul>
        </div>
        <div className="mt-5 flex gap-2">
          <Link href="/harga" className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-center text-sm font-bold text-white">Upgrade Premium</Link>
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200">Tutup</button>
        </div>
      </div>
    </div>
  );
}
