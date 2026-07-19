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
  const [paymentMode, setPaymentMode] = useState<"midtrans" | "manual_transfer">("manual_transfer");
  const [bankAccounts, setBankAccounts] = useState<Array<{ bank: string; number: string; holderName: string; note?: string }>>([]);
  const [transferInstructions, setTransferInstructions] = useState("");
  const [confirmationNote, setConfirmationNote] = useState("");
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

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
        setPaymentMode(d.paymentMode || "manual_transfer");
        setBankAccounts(Array.isArray(d.bankAccounts) ? d.bankAccounts : []);
        setTransferInstructions(d.transferInstructions || "");
        setConfirmationNote(d.confirmationNote || "");
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

  const ADMIN_WHATSAPP = "6282210430893"; // Format internasional (0822... → 62822...)

  async function handleConfirmTransfer() {
    if (!order || confirming) return;
    setConfirming(true);
    setError("");

    // 1. Catat konfirmasi di server (background, tidak blocking WA)
    fetch("/api/payment/confirm-transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setConfirmed(true);
      })
      .catch(() => {});

    // 2. Buka WhatsApp admin dengan pesan konfirmasi pre-filled
    const waMessage =
      `Halo Admin Start Digital 👋\n\n` +
      `Saya ingin konfirmasi pembayaran:\n\n` +
      `📋 *Order ID:* #${order.id}\n` +
      `👤 *Nama:* ${order.profileName}\n` +
      `📧 *Email:* ${order.profileEmail}\n` +
      `💎 *Paket:* ${order.planName}\n` +
      `💰 *Jumlah:* Rp${order.amount.toLocaleString("id-ID")}\n` +
      `🏦 *Metode:* Transfer Bank Manual\n\n` +
      `Saya sudah melakukan transfer. Mohon verifikasi agar akun premium saya bisa aktif. Terima kasih! 🙏`;

    const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    setConfirming(false);
  }

  function copyBankNumber(num: string) {
    navigator.clipboard.writeText(num).then(() => {
      setCopiedBank(num);
      setTimeout(() => setCopiedBank(null), 1800);
    });
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

      {paymentMode === "midtrans" && !midtransAvailable && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          ⚠️ Midtrans belum dikonfigurasi. Hubungi admin untuk mengaktifkan pembayaran online.
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
          {paymentMode === "midtrans" ? (
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
          ) : (
            <div className="space-y-4">
              <style>{`
                @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
                @keyframes pulseGlow { 0%,100%{box-shadow:0 0 24px rgba(16,185,129,0.25)} 50%{box-shadow:0 0 36px rgba(16,185,129,0.55)} }
                @keyframes spin-slow { to { transform: rotate(360deg); } }
                .tier-shimmer::before{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%);background-size:200% 100%;animation:shimmer 3.5s linear infinite;pointer-events:none;border-radius:inherit}
                .floaty{animation:floaty 3s ease-in-out infinite}
                .pulse-glow{animation:pulseGlow 2.4s ease-in-out infinite}
              `}</style>

              {(() => {
                const tier =
                  order.planSlug === "pro" ? "gold"
                  : order.planSlug === "enterprise" ? "platinum"
                  : "silver";

                const tierStyle = {
                  silver: {
                    label: "SILVER",
                    border: "border-slate-300/40",
                    ring: "ring-slate-300/20",
                    gradient: "from-slate-200 via-slate-100 to-slate-300",
                    accent: "text-slate-200",
                    accentBg: "bg-slate-200",
                    glow: "shadow-slate-400/30",
                    numberBg: "from-slate-800 to-slate-900",
                    numberBorder: "border-slate-300/30",
                    icon: "🥈",
                  },
                  gold: {
                    label: "GOLD",
                    border: "border-amber-300/50",
                    ring: "ring-amber-300/30",
                    gradient: "from-amber-300 via-yellow-200 to-amber-400",
                    accent: "text-amber-200",
                    accentBg: "bg-amber-300",
                    glow: "shadow-amber-400/40",
                    numberBg: "from-amber-950 to-yellow-950",
                    numberBorder: "border-amber-300/40",
                    icon: "🥇",
                  },
                  platinum: {
                    label: "PLATINUM",
                    border: "border-cyan-200/50",
                    ring: "ring-cyan-200/30",
                    gradient: "from-cyan-100 via-slate-50 to-blue-200",
                    accent: "text-cyan-200",
                    accentBg: "bg-cyan-200",
                    glow: "shadow-cyan-300/40",
                    numberBg: "from-slate-900 to-cyan-950",
                    numberBorder: "border-cyan-200/40",
                    icon: "💎",
                  },
                }[tier];

                return (
                  <>
                    {/* Header tier banner */}
                    <div className={`relative overflow-hidden rounded-3xl border ${tierStyle.border} bg-gradient-to-br ${tierStyle.gradient} p-[1px] shadow-xl ${tierStyle.glow}`}>
                      <div className="tier-shimmer relative rounded-3xl bg-slate-950 p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="floaty text-3xl">{tierStyle.icon}</span>
                            <div>
                              <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${tierStyle.accent}`}>
                                {tierStyle.label} Membership
                              </p>
                              <p className="mt-0.5 text-sm font-bold text-white">{order.planName}</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white">
                            {order.planPeriod.toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Total yang harus ditransfer
                          </p>
                          <p className={`mt-1 text-3xl font-black tracking-tight ${tierStyle.accent}`}>
                            Rp{order.amount.toLocaleString("id-ID")}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Transfer sesuai nominal tepat — jangan dibulatkan.
                          </p>
                        </div>
                      </div>
                    </div>

                    {transferInstructions && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs leading-relaxed text-slate-300">
                          {transferInstructions}
                        </p>
                      </div>
                    )}

                    {/* Bank cards */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Pilih rekening tujuan
                      </p>
                      {bankAccounts.map((bank, i) => (
                        <div
                          key={i}
                          className={`group relative overflow-hidden rounded-2xl border ${tierStyle.border} bg-gradient-to-br ${tierStyle.numberBg} p-4 shadow-lg transition hover:scale-[1.02] hover:shadow-xl`}
                          style={{ animation: `floaty ${3 + i * 0.3}s ease-in-out infinite` }}
                        >
                          <div className="tier-shimmer pointer-events-none absolute inset-0 rounded-2xl" />

                          <div className="relative flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`grid h-8 w-8 place-items-center rounded-lg ${tierStyle.accentBg} text-base font-black text-slate-900 shadow-md`}>
                                  {bank.bank.charAt(0)}
                                </span>
                                <div>
                                  <p className="text-base font-black text-white">{bank.bank}</p>
                                  <p className="text-[11px] text-slate-400">{bank.holderName}</p>
                                </div>
                              </div>

                              <div className={`mt-3 flex items-center justify-between gap-2 rounded-xl border ${tierStyle.numberBorder} bg-black/40 px-3 py-2.5`}>
                                <span className="font-mono text-base font-bold tracking-wider text-white sm:text-lg">
                                  {bank.number.replace(/(\d{4})(?=\d)/g, "$1 ")}
                                </span>
                                <button
                                  onClick={() => copyBankNumber(bank.number)}
                                  className={`shrink-0 rounded-lg ${tierStyle.accentBg} px-3 py-1.5 text-xs font-bold text-slate-900 shadow transition hover:scale-105 active:scale-95`}
                                >
                                  {copiedBank === bank.number ? "✓ Tersalin" : "📋 Copy"}
                                </button>
                              </div>

                              {bank.note && (
                                <p className="mt-2 text-[11px] italic text-slate-400">
                                  💡 {bank.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tombol konfirmasi → WhatsApp */}
                    <button
                      onClick={handleConfirmTransfer}
                      disabled={confirming || confirmed || isPaid}
                      className={`pulse-glow relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-5 py-4 text-sm font-black text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100`}
                    >
                      <span className="tier-shimmer absolute inset-0" />
                      <span className="relative flex items-center gap-2">
                        {confirmed ? (
                          <>✓ Terkirim ke WhatsApp Admin</>
                        ) : confirming ? (
                          <>Memproses...</>
                        ) : isPaid ? (
                          <>✓ Sudah Dibayar</>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden>
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Saya Sudah Transfer — Konfirmasi via WhatsApp
                          </>
                        )}
                      </span>
                    </button>

                    {confirmationNote && (
                      <p className="text-center text-[10px] leading-relaxed text-slate-500">
                        {confirmationNote}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          )}

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
