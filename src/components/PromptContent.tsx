"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

type AccessResult = {
  allowed: boolean;
  content?: string;
  isPremiumUser?: boolean;
  planSlug?: string;
  reason?: "PREMIUM_REQUIRED" | "PAYMENT_PENDING" | "TRIAL_EXPIRED" | string;
  trial?: {
    active: boolean;
    expired: boolean;
    expiresAt: string;
    remainingDays: number;
    trialDays: number;
  } | null;
};

export default function PromptContent({
  isPremium,
  promptId,
}: {
  isPremium: boolean;
  promptId: number;
}) {
  const [access, setAccess] = useState<AccessResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileEmail = localStorage.getItem("sd_user_email") || undefined;
    fetch("/api/prompts/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId, profileEmail }),
    })
      .then((r) => r.json())
      .then((data) => setAccess(data))
      .catch(() => setAccess({ allowed: false, reason: "NETWORK_ERROR" }))
      .finally(() => setLoading(false));
  }, [promptId]);

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-48 animate-pulse rounded-xl bg-white/5" />
      </div>
    );
  }

  if (access?.allowed && access.content) {
    const freeMode = !access.isPremiumUser;
    return (
      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        {access.isPremiumUser ? (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            💎 Akses tanpa batas aktif — {access.planSlug}
          </div>
        ) : access.trial ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/20 bg-amber-500/[0.08] px-3 py-2 text-xs text-amber-200">
            <span>⏳ Akses gratis: {access.trial.remainingDays} hari tersisa dari {access.trial.trialDays} hari</span>
            <Link href="/harga" className="font-bold text-white hover:underline">Upgrade tanpa batas →</Link>
          </div>
        ) : null}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Prompt Lengkap</h2>
          <CopyButton text={access.content} promptId={promptId} />
        </div>

        {freeMode && (
          <p className="mb-2 text-[11px] text-slate-500">
            Mode gratis: konten tidak dapat dipilih atau disalin manual. Gunakan tombol Copy Prompt; kuota 1x per prompt.
          </p>
        )}

        <pre
          className={`max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-200 ${freeMode ? "select-none" : "select-text"}`}
          onCopy={freeMode ? (event) => event.preventDefault() : undefined}
          onCut={freeMode ? (event) => event.preventDefault() : undefined}
          onContextMenu={freeMode ? (event) => event.preventDefault() : undefined}
          onKeyDown={
            freeMode
              ? (event) => {
                  if ((event.ctrlKey || event.metaKey) && ["a", "c", "x"].includes(event.key.toLowerCase())) {
                    event.preventDefault();
                  }
                }
              : undefined
          }
          tabIndex={freeMode ? -1 : 0}
          aria-label="Isi prompt"
        >
          {access.content}
        </pre>
      </div>
    );
  }

  const expired = access?.reason === "TRIAL_EXPIRED";
  const pending = access?.reason === "PAYMENT_PENDING";
  return (
    <div className="relative mt-8 min-h-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center">
        <span className="text-4xl">{expired ? "⌛" : pending ? "⏳" : "🔒"}</span>
        <h3 className="mt-4 text-xl font-bold text-white">
          {expired ? "Masa Akses Gratis Berakhir" : pending ? "Menunggu Pembayaran" : "Konten Premium"}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          {expired
            ? "Masa akses gratis 7 hari pada perangkat ini telah berakhir. Upgrade untuk melanjutkan akses, copy tanpa batas, dan Prompt Troubleshooter."
            : pending
            ? "Akun Anda menunggu penyelesaian atau verifikasi pembayaran."
            : "Prompt ini tersedia untuk member Pro dan Enterprise."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/harga" className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white">
            Upgrade Premium
          </Link>
          <Link href={pending ? "/dashboard?tab=membership" : "/masuk"} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white">
            {pending ? "Cek Pembayaran" : "Masuk"}
          </Link>
        </div>
      </div>
    </div>
  );
}
