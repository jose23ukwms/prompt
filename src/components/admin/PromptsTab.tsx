"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DeletePromptButton from "@/components/DeletePromptButton";

type Row = {
  id: number;
  slug: string;
  title: string;
  categoryName: string;
  categoryIcon: string;
  isPremium: boolean;
  rating: number;
  usersCount: number;
  copyCount: number;
};

export default function PromptsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => setRows(d.prompts || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "free" && r.isPremium) return false;
      if (filter === "premium" && !r.isPremium) return false;
      if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, q, filter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari prompt..."
              className="w-56 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
            {(["all", "free", "premium"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 font-semibold capitalize transition ${
                  filter === f ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {f === "all" ? "Semua" : f}
              </button>
            ))}
          </div>
        </div>
        <Link
          href="/admin/prompt/new"
          className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/40"
        >
          <span className="text-base leading-none transition-transform group-hover:rotate-90">+</span>
          Tambah Prompt
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <h2 className="text-sm font-bold text-white">
            {filtered.length} Prompt
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Judul</th>
                <th className="px-3 py-3">Kategori</th>
                <th className="px-3 py-3">Akses</th>
                <th className="px-3 py-3">Rating</th>
                <th className="px-3 py-3 text-right">Statistik</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Tidak ada prompt.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-3 max-w-xs">
                      <Link href={`/prompt/${p.slug}`} className="font-medium text-white hover:text-indigo-300 line-clamp-1">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-400">{p.categoryIcon} {p.categoryName}</td>
                    <td className="px-3 py-3">
                      {p.isPremium ? (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">PREMIUM</span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">GRATIS</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-amber-400">★ {p.rating || "-"}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-xs text-slate-400">
                      👥 {p.usersCount.toLocaleString("id-ID")} · 📋 {p.copyCount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/prompt/${p.id}`}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-200 transition hover:border-indigo-400/50 hover:bg-white/5"
                        >
                          Edit
                        </Link>
                        <DeletePromptButton id={p.id} onDeleted={load} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
