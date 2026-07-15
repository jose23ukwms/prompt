"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function FailedInner() {
  const search = useSearchParams();
  const orderId = search.get("orderId");

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-rose-400/30 bg-gradient-to-b from-rose-500/10 to-slate-900/40 p-8 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-4xl text-white shadow-xl shadow-rose-500/30">
          ✕
        </div>

        <h1 className="mt-6 text-3xl font-black text-white">Pembayaran Gagal</h1>
        <p className="mt-2 text-sm text-slate-300">
          Pembayaran tidak dapat diproses. Silakan coba lagi atau gunakan metode lain.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left text-sm text-slate-300">
          <p className="font-semibold text-white">Kemungkinan penyebab:</p>
          <ul className="mt-3 space-y-1.5 text-xs">
            <li>• Saldo/limit kartu tidak mencukupi</li>
            <li>• Pembayaran ditolak oleh bank penerbit</li>
            <li>• Terindikasi sebagai transaksi mencurigakan</li>
            <li>• Timeout / gangguan jaringan</li>
          </ul>
        </div>

        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {orderId ? (
            <Link
              href={`/pembayaran/${orderId}`}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white hover:opacity-90"
            >
              Coba Bayar Lagi
            </Link>
          ) : (
            <Link
              href="/harga"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white hover:opacity-90"
            >
              Kembali ke Harga
            </Link>
          )}
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Buka Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat...</div>}>
      <FailedInner />
    </Suspense>
  );
}
