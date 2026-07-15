"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";

type Order = {
  id: number;
  amount: number;
  status: string;
  midtransToken: string | null;
  midtransRedirectUrl: string | null;
  paymentType: string | null;
  paidAt: string | null;
  createdAt: string;
  profileName: string;
  profileEmail: string;
  profilePhone: string;
  planName: string;
  planSlug: string;
  planPeriod: string;
  planFeatures: string[];
};

// Deklarasi global untuk Snap
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function PembayaranPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const [snapUrl, setSnapUrl] = useState("");
  const [clientKey, setClientKey] = useState("");
  const [midtransAvailable, setMidtransAvailable] = useState(true);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment/order/${orderId}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Order tidak ditemukan.");
        return;
      }
      setOrder(data.order);

      // Redirect jika sudah selesai
      if (data.order.status === "approved") {
        router.replace(`/pembayaran/sukses?orderId=${orderId}`);
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    loadOrder();
    // Ambil konfigurasi Midtrans dari environment
    fetch("/api/payment/config")
      .then((r) => r.json())
      .then((d) => {
        setSnapUrl(d.snapUrl || "");
        setClientKey(d.clientKey || "");
        setMidtransAvailable(!!d.configured);
      })
      .catch(() => setMidtransAvailable(false));
  }, [loadOrder]);

  async function handlePay() {
    if (creating || !order) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Gagal membuat transaksi.");
        return;
      }

      // Buka Snap popup
      if (window.snap && snapReady) {
        window.snap.pay(data.token, {
          onSuccess: () => {
            router.push(`/pembayaran/sukses?orderId=${orderId}`);
          },
          onPending: () => {
            router.push(`/pembayaran/menunggu?orderId=${orderId}`);
          },
          onError: () => {
            router.push(`/pembayaran/gagal?orderId=${orderId}`);
          },
          onClose: () => {
            // User menutup popup — tetap di halaman ini
            loadOrder();
          },
        });
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError("Snap belum siap. Muat ulang halaman ini.");
      }
    } catch {
      setError("Terjadi kesalahan saat membuat transaksi.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-white/10" />
          <div className="h-64 rounded-3xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <span className="text-5xl">⚠️</span>
        <h1 className="mt-4 text-2xl font-bold">{error}</h1>
        <Link href="/harga" className="mt-4 inline-block rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold">
          Kembali ke Harga
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const isPaid = order.status === "approved";
  const isFailed = ["rejected", "cancelled", "expired"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {snapUrl && clientKey && (
        <Script
          src={snapUrl}
          data-client-key={clientKey}
          strategy="afterInteractive"
          onLoad={() => setSnapReady(true)}
        />
      )}

      {/* Header dengan progress */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
          ← Kembali ke Dashboard
        </Link>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <Step active label="Daftar" done />
          <Bar />
          <Step active label="Pembayaran" />
          <Bar />
          <Step label="Selesai" />
        </div>
      </div>

      <h1 className="text-3xl font-black">Selesaikan Pembayaran</h1>
      <p className="mt-1 text-sm text-slate-400">
        Bayar untuk mengaktifkan paket {order.planName} Anda.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {!midtransAvailable && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          ⚠️ Midtrans belum dikonfigurasi. Set <code className="rounded bg-white/10 px-1">MIDTRANS_SERVER_KEY</code> dan{" "}
          <code className="rounded bg-white/10 px-1">MIDTRANS_CLIENT_KEY</code> di environment.
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Detail order */}
        <div className="space-y-5">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-bold text-white">Rincian Pesanan</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Order ID" value={`#${order.id}`} />
              <Row label="Paket" value={order.planName} highlight />
              <Row label="Periode" value={order.planPeriod} />
              <Row label="Nama" value={order.profileName} />
              <Row label="Email" value={order.profileEmail} />
              {order.profilePhone && <Row label="WhatsApp" value={order.profilePhone} />}
              <Row
                label="Status"
                value={
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      isPaid
                        ? "bg-emerald-500/20 text-emerald-300"
                        : isFailed
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {order.status}
                  </span>
                }
              />
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total pembayaran</span>
                <span className="text-2xl font-black text-white">
                  Rp{order.amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-bold text-white">Benefit yang Aktif Setelah Bayar</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {order.planFeatures.map((f) => (
                <li key={f} className="flex gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span> {f}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Aksi pembayaran */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/[0.12] to-fuchsia-500/[0.08] p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Metode Pembayaran
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Kartu Kredit, GoPay, OVO, DANA, ShopeePay, QRIS, Transfer Bank, Virtual Account.
            </p>
            <div className="mt-4 flex flex-wrap gap-1">
              {["Visa", "MC", "GoPay", "OVO", "DANA", "QRIS", "BCA VA"].map((m) => (
                <span key={m} className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-200">
                  {m}
                </span>
              ))}
            </div>

            <button
              onClick={handlePay}
              disabled={creating || isPaid || !midtransAvailable}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 disabled:opacity-50"
            >
              {creating
                ? "Memuat Midtrans..."
                : isPaid
                ? "✓ Sudah Dibayar"
                : `Bayar Rp${order.amount.toLocaleString("id-ID")}`}
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-500">
              Anda akan diarahkan ke halaman pembayaran Midtrans yang aman.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-xs text-slate-400">
            <p className="font-semibold text-white">Butuh bantuan?</p>
            <p className="mt-2">
              Hubungi tim kami di{" "}
              <a href="mailto:help@startdigital.app" className="text-indigo-300">
                help@startdigital.app
              </a>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium ${highlight ? "text-indigo-300" : "text-white"}`}>{value}</span>
    </div>
  );
}

function Step({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
          done
            ? "bg-emerald-500 text-white"
            : active
            ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
            : "bg-white/10 text-slate-500"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span className={active || done ? "text-white" : "text-slate-500"}>{label}</span>
    </div>
  );
}

function Bar() {
  return <span className="h-px w-6 bg-white/10" />;
}
