"use client";

import { useEffect, useMemo, useState } from "react";

type Profile = {
  id: number;
  email: string;
  name: string;
  phone: string;
  planSlug: string;
  status: string;
  role: string;
  createdAt: string;
};
type Order = { profileEmail: string; status: string };

const PLAN_LABELS: Record<string, string> = {
  free: "Gratis 7 Hari",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default function CustomersTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [q, setQ] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/profiles").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
    ])
      .then(([p, o]) => {
        setProfiles(p.profiles || []);
        setOrders(o.orders || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvedEmails = useMemo(
    () => new Set(orders.filter((o) => o.status === "approved").map((o) => o.profileEmail)),
    [orders]
  );

  const filtered = useMemo(
    () =>
      profiles.filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.email.toLowerCase().includes(q.toLowerCase())
      ),
    [profiles, q]
  );

  const act = async (profileId: number, action: "approved" | "pending" | "reject" | "delete") => {
    const labels = {
      approved: "mengaktifkan/approve",
      pending: "mengubah status menjadi pending",
      reject: "menolak/reject",
      delete: "menghapus",
    };
    if (!confirm(`Yakin ingin ${labels[action]} pengguna ini?`)) return;

    setBusy(profileId);
    try {
      const res = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Gagal mengubah status pengguna.");
      }
      loadData();
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-64 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <p className="text-sm text-slate-400">{filtered.length} pengguna</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-3 py-3">Kontak</th>
                <th className="px-3 py-3">Paket</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 font-semibold">Aksi Pengelola</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Belum ada pengguna.</td></tr>
              ) : (
                filtered.map((p) => {
                  const isOwner = p.email === "ucidesya@gmail.com";
                  const displayEmail = isOwner ? "help@startdigital.app (Owner)" : p.email;
                  return (
                    <tr key={p.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/20 text-xs font-black text-white">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <span className="font-medium text-white block">{p.name}</span>
                            <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">{p.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-slate-300 font-mono text-xs">{displayEmail}</p>
                        {p.phone && <p className="text-xs text-slate-500">{p.phone}</p>}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          p.planSlug === "free" ? "bg-slate-700 text-slate-300" : "bg-amber-500/15 text-amber-300"
                        }`}>
                          {PLAN_LABELS[p.planSlug] || p.planSlug}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                          p.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : p.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                          {p.status === "active" ? "Approved / Active" : p.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {isOwner ? (
                          <span className="text-xs font-bold text-slate-500 italic">Protected (Master Account)</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              disabled={busy === p.id}
                              onClick={() => act(p.id, "approved")}
                              className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300 transition disabled:opacity-40"
                            >
                              Approved
                            </button>
                            <button
                              disabled={busy === p.id}
                              onClick={() => act(p.id, "pending")}
                              className="rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-300 transition disabled:opacity-40"
                            >
                              Pending
                            </button>
                            <button
                              disabled={busy === p.id}
                              onClick={() => act(p.id, "reject")}
                              className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 px-2.5 py-1 text-xs font-bold text-rose-300 transition disabled:opacity-40"
                            >
                              Reject
                            </button>
                            <button
                              disabled={busy === p.id}
                              onClick={() => act(p.id, "delete")}
                              className="rounded-lg bg-red-800/30 hover:bg-red-800/50 border border-red-500/40 px-2.5 py-1 text-xs font-bold text-red-200 transition disabled:opacity-40 ml-2"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
