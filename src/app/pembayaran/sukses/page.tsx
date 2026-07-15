"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
  const search = useSearchParams();
  const orderId = search.get("orderId");
  const [order, setOrder] = useState<{
    id: number;
    amount: number;
    status: string;
    planName: string;
    profileName: string;
    profileEmail: string;
    paymentType: string | null;
  } | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/payment/order/${orderId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setOrder(d.order);
      });
  }, [orderId]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-emerald-500/10 to-slate-900/40 p-8 text-center">
        {/* Icon sukses */}
        <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-4xl text-white shadow-xl shadow-emerald-500/30">
          <span>✓</span>
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
        </div>

        <h1 className="mt-6 text-3xl font-black text-white">Pembayaran Berhasil!</h1>
        <p className="mt-2 text-sm text-slate-300">
          Terima kasih! Akun premium Anda sekarang aktif.
        </p>

        {order && (
          <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Order ID</span>
              <span className="font-mono text-white">#{order.id}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Paket</span>
              <span className="font-semibold text-emerald-300">{order.planName}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Pembayar</span>
              <span className="text-white">{order.profileName}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Email</span>
              <span className="text-white">{order.profileEmail}</span>
            </div>
            {order.paymentType && (
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Metode</span>
                <span className="uppercase text-white">{order.paymentType}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Total dibayar</span>
              <span className="text-lg font-black text-emerald-300">
                Rp{order.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          <Link
            href="/prompts"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white hover:opacity-90"
          >
            Jelajahi Prompt Premium
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Buka Dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Bukti pembayaran juga tersedia di tab Notifikasi dashboard Anda.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat...</div>}>
      <SuccessInner />
    </Suspense>
  );
}
