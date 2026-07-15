"use client";

import { useEffect, useState } from "react";

type Order = {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  profileName: string;
  profileEmail: string;
  planName: string;
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [busy, setBusy] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (orderId: number, action: "approve" | "reject") => {
    const label = action === "approve" ? "menyetujui" : "menolak";
    if (!confirm(`Yakin ingin ${label} pesanan ini?`)) return;
    setBusy(orderId);
    try {
      await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      load();
    } finally {
      setBusy(null);
    }
  };

  const counts = {
    pending: orders.filter((o) => o.status === "pending").length,
    approved: orders.filter((o) => o.status === "approved").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
    all: orders.length,
  };
  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const tabs: { id: typeof filter; label: string; tone: string }[] = [
    { id: "pending", label: "Menunggu", tone: "text-amber-300" },
    { id: "approved", label: "Disetujui", tone: "text-emerald-300" },
    { id: "rejected", label: "Ditolak", tone: "text-rose-300" },
    { id: "all", label: "Semua", tone: "text-slate-300" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              filter === t.id
                ? "border-indigo-400/50 bg-indigo-500/10 text-white"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
            <span className={`rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums ${t.tone}`}>
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center">
          <span className="text-4xl">📭</span>
          <p className="text-sm text-slate-400">Tidak ada pesanan pada kategori ini.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {shown.map((o, i) => (
            <div
              key={o.id}
              className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20"
              style={{ animation: `fadeUp 0.35s ease ${i * 0.04}s both` }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/20 text-sm font-black text-white">
                  {o.profileName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{o.profileName}</p>
                  <p className="text-xs text-slate-500">{o.profileEmail}</p>
                </div>
              </div>

              <div className="text-sm">
                <p className="font-medium text-indigo-300">{o.planName}</p>
                <p className="text-xs text-slate-500">
                  {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              <p className="text-base font-black tabular-nums text-white">
                Rp{o.amount.toLocaleString("id-ID")}
              </p>

              <div className="flex items-center gap-2">
                {o.status === "pending" ? (
                  <>
                    <button
                      disabled={busy === o.id}
                      onClick={() => act(o.id, "approve")}
                      className="rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {busy === o.id ? "..." : "✓ Setujui"}
                    </button>
                    <button
                      disabled={busy === o.id}
                      onClick={() => act(o.id, "reject")}
                      className="rounded-lg border border-rose-500/40 px-3.5 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
                    >
                      Tolak
                    </button>
                  </>
                ) : (
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                      o.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {o.status === "approved" ? "Disetujui" : "Ditolak"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
