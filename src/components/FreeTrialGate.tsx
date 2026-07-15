"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const ALWAYS_ALLOWED = [
  "/harga",
  "/masuk",
  "/daftar",
  "/pembayaran",
  "/syarat-ketentuan",
  "/kebijakan-privasi",
];

type TrialStatus = {
  unlimited: boolean;
  isPremium: boolean;
  trial: null | {
    active: boolean;
    expired: boolean;
    expiresAt: string;
    remainingDays: number;
    trialDays: number;
  };
};

export default function FreeTrialGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<TrialStatus | null>(null);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const profileEmail = localStorage.getItem("sd_user_email") || undefined;
    fetch("/api/access/trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileEmail }),
    })
      .then((r) => r.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus(null));
  }, [pathname]);

  const legalOrConversionPage = ALWAYS_ALLOWED.some((path) => pathname?.startsWith(path));
  const expired = status?.trial?.expired && !status.unlimited;

  return (
    <>
      {status?.trial?.active && !legalOrConversionPage && (
        <div className="border-b border-amber-400/20 bg-amber-500/[0.07] px-4 py-2 text-center text-xs text-amber-100">
          Akses gratis perangkat ini tersisa <b>{status.trial.remainingDays} hari</b>. Setelah itu diperlukan upgrade.{" "}
          <Link href="/harga" className="font-bold text-white underline underline-offset-2">Lihat Premium</Link>
        </div>
      )}

      <div className={expired && !legalOrConversionPage ? "pointer-events-none select-none blur-sm" : ""} aria-hidden={expired && !legalOrConversionPage}>
        {children}
      </div>

      {expired && !legalOrConversionPage && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-amber-400/30 bg-slate-900 p-8 text-center shadow-2xl">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl">⌛</span>
            <h2 className="mt-5 text-2xl font-black text-white">Akses Gratis 7 Hari Berakhir</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Masa evaluasi pada perangkat/browser ini telah selesai. Upgrade untuk melanjutkan akses prompt, copy tanpa batas, workflow otomatis, dan Prompt Troubleshooter.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Link href="/harga" className="pointer-events-auto rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white">Lihat Paket Premium</Link>
              <Link href="/masuk" className="pointer-events-auto rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">Saya Sudah Member</Link>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
              <Link className="pointer-events-auto hover:text-white" href="/syarat-ketentuan">Syarat & Ketentuan</Link>
              <Link className="pointer-events-auto hover:text-white" href="/kebijakan-privasi">Kebijakan Privasi</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
