"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function PendingInner() {
  const search = useSearchParams();
  const router = useRouter();
  const orderId = search.get("orderId");
  const [status, setStatus] = useState<string>("pending");

  useEffect(() => {
    if (!orderId) return;
    // Polling status setiap 5 detik
    const check = async () => {
      const res = await fetch(`/api/payment/order/${orderId}`);
      const data = await res.json();
      if (data.ok) {
        setStatus(data.order.status);
        if (data.order.status === "approved") {
          router.replace(`/pembayaran/sukses?orderId=${orderId}`);
        }
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [orderId, router]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-500/10 to-slate-900/40 p-8 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl text-white shadow-xl shadow-amber-500/30">
          <span className="animate-pulse">⏳</span>
        </div>

        <h1 className="mt-6 text-3xl font-black text-white">Menunggu Pembayaran</h1>
        <p className="mt-2 text-sm text-slate-300">
          Silakan selesaikan pembayaran sesuai instruksi. Halaman ini akan otomatis update saat pembayaran diterima.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-amber-200">
          <span className="h-2 w-2 animate-ping rounded-full bg-amber-400" />
          <span>Status: {status}</span>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left text-sm text-slate-300">
          <p className="font-semibold text-white">Petunjuk pembayaran:</p>
          <ol className="mt-3 space-y-1.5 text-xs">
            <li>1. Cek email untuk instruksi pembayaran</li>
            <li>2. Selesaikan pembayaran sebelum kedaluwarsa</li>
            <li>3. Simpan bukti pembayaran</li>
            <li>4. Status akan otomatis diperbarui setelah bank memproses</li>
          </ol>
        </div>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-block rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Cek Status di Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat...</div>}>
      <PendingInner />
    </Suspense>
  );
}
