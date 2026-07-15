"use client";

import { useEffect, useState } from "react";

type Stats = { total: number; free: number; premium: number; users: number; copies: number };
type Cat = { id: number; name: string; icon: string; color: string; count: number };
type Order = { id: number; amount: number; status: string; profileName: string; planName: string };

export default function OverviewTab({ onGoto }: { onGoto: (tab: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/overview").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
    ])
      .then(([ov, od]) => {
        setStats(ov.stats);
        setCats(ov.topCategories || []);
        setOrders(od.orders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = orders.filter((o) => o.status === "pending");
  const approved = orders.filter((o) => o.status === "approved");
  const revenue = approved.reduce((s, o) => s + o.amount, 0);

  const cards = stats
    ? [
        { label: "Total Prompt", value: stats.total, icon: "📦", tone: "from-indigo-500/20 to-indigo-500/5", ring: "#6366f1" },
        { label: "Prompt Premium", value: stats.premium, icon: "💎", tone: "from-amber-500/20 to-amber-500/5", ring: "#f59e0b" },
        { label: "Total Dipakai", value: `${(stats.users / 1000).toFixed(1)}k`, icon: "👥", tone: "from-pink-500/20 to-pink-500/5", ring: "#ec4899" },
        { label: "Total Disalin", value: `${(stats.copies / 1000).toFixed(1)}k`, icon: "📋", tone: "from-sky-500/20 to-sky-500/5", ring: "#0ea5e9" },
        { label: "Pesanan Pending", value: pending.length, icon: "⏳", tone: "from-orange-500/20 to-orange-500/5", ring: "#f97316" },
        { label: "Pendapatan", value: `Rp${(revenue / 1000).toFixed(0)}k`, icon: "💰", tone: "from-violet-500/20 to-violet-500/5", ring: "#a855f7" },
      ]
    : [];

  const maxCat = cats.length ? cats[0].count || 1 : 1;

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
            ))
          : cards.map((c, i) => (
              <div
                key={c.label}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${c.tone} p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/20`}
                style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}
              >
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${c.ring}22` }}
                >
                  {c.icon}
                </div>
                <p className="mt-3 text-2xl font-black tabular-nums text-white">{c.value}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
              </div>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Pending queue */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="font-bold text-white">Perlu Tindakan</h2>
            <button
              onClick={() => onGoto("orders")}
              className="text-xs font-medium text-indigo-300 hover:text-indigo-200"
            >
              Kelola pesanan →
            </button>
          </div>
          <div className="p-4">
            {pending.length === 0 ? (
              <div className="grid place-items-center gap-2 py-10 text-center">
                <span className="text-3xl">✅</span>
                <p className="text-sm text-slate-400">Tidak ada pesanan menunggu persetujuan.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {pending.slice(0, 5).map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{o.profileName}</p>
                      <p className="text-xs text-slate-400">{o.planName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-300">Rp{o.amount.toLocaleString("id-ID")}</p>
                      <button
                        onClick={() => onGoto("orders")}
                        className="text-[11px] font-semibold text-indigo-300 hover:underline"
                      >
                        Tinjau
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top categories */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-bold text-white">Kategori Terlaris</h2>
          <div className="mt-4 space-y-3.5">
            {cats.slice(0, 6).map((c, i) => (
              <div key={c.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-300">{c.icon} {c.name}</span>
                  <span className="tabular-nums text-slate-500">{c.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(c.count / maxCat) * 100}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
