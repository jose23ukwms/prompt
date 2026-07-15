"use client";

import { useEffect, useState } from "react";

type Status = {
  database: string;
  stats: {
    categories: number;
    plans: number;
    totalPrompts: number;
    freePrompts: number;
    premiumPrompts: number;
    appBuilderPrompts: number;
    gasPrompts: number;
    totalDevices: number;
    activeTrials: number;
    expiredTrials: number;
  };
  target: {
    freePrompts: number;
    premiumPrompts: number;
    appBuilderPrompts: number;
    gasPrompts: number;
    totalPrompts: number;
  };
};

type AuditSummary = {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  averageScore: number;
  warnings: number;
  errors: number;
};

export default function DataTab() {
  const [status, setStatus] = useState<Status | null>(null);
  const [audit, setAudit] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/data/status");
    const data = await res.json();
    setStatus(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function runAudit() {
    setAuditing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/data/audit");
      const data = await res.json();
      setAudit(data.summary ?? null);
      setMessage(`Audit selesai: ${data.summary?.passed ?? 0}/${data.summary?.total ?? 0} prompt lulus quality gate.`);
    } catch {
      setMessage("Audit gagal dijalankan.");
    } finally {
      setAuditing(false);
    }
  }

  async function ensureSeed() {
    if (!confirm("Jalankan sinkronisasi data? Proses ini tidak menghapus data lama, hanya menambahkan data yang kurang.")) return;
    setSeeding(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/data/ensure", { method: "POST" });
      const data = await res.json();
      setMessage(`${data.message} Ditambahkan: free ${data.inserted?.free ?? 0}, app builder ${data.inserted?.appBuilder ?? 0}, premium ${data.inserted?.premium ?? 0}.`);
      await load();
    } catch {
      setMessage("Gagal menjalankan sinkronisasi data.");
    } finally {
      setSeeding(false);
    }
  }

  function exportBackup() {
    window.open("/api/admin/data/export", "_blank");
  }

  const cards = status
    ? [
        { label: "Database", value: status.database, icon: "🟢" },
        { label: "Kategori", value: status.stats.categories, icon: "🗂️" },
        { label: "Paket", value: status.stats.plans, icon: "💳" },
        { label: "Total Prompt", value: status.stats.totalPrompts, icon: "📦" },
        { label: "Prompt Gratis", value: status.stats.freePrompts, icon: "🆓" },
        { label: "Prompt Premium", value: status.stats.premiumPrompts, icon: "💎" },
        { label: "App Builder", value: status.stats.appBuilderPrompts, icon: "🛠️" },
        { label: "GAS + Sheets", value: status.stats.gasPrompts, icon: "📗" },
        { label: "Trial Aktif", value: status.stats.activeTrials, icon: "⏳" },
        { label: "Trial Berakhir", value: status.stats.expiredTrials, icon: "⌛" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.08] to-transparent p-5">
        <h2 className="text-lg font-bold text-white">Data & Supabase Production</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Gunakan tab ini setelah Anda menghubungkan <code className="rounded bg-white/10 px-1">DATABASE_URL</code> ke Supabase PostgreSQL. Data akan tersimpan online di Supabase, bukan di localhost, sehingga bisa dilihat banyak orang dan dikelola dari control panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
            ))
          : cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xl">{c.icon}</div>
                <p className="mt-2 text-xl font-black text-white">{String(c.value)}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
              </div>
            ))}
      </div>

      {status && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-bold text-white">Target Produksi</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            <Target label="Gratis" current={status.stats.freePrompts} target={status.target.freePrompts} />
            <Target label="Premium" current={status.stats.premiumPrompts} target={status.target.premiumPrompts} />
            <Target label="App Builder" current={status.stats.appBuilderPrompts} target={status.target.appBuilderPrompts} />
            <Target label="GAS + Sheets" current={status.stats.gasPrompts} target={status.target.gasPrompts} />
            <Target label="Total" current={status.stats.totalPrompts} target={status.target.totalPrompts} />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[0.07] to-transparent p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white">Quality Audit & Follow-up Automation</h3>
            <p className="mt-1 text-sm text-slate-400">
              Audit seluruh prompt terhadap struktur production-grade dan cek workflow lanjutan otomatis.
            </p>
          </div>
          <button
            onClick={runAudit}
            disabled={auditing}
            className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {auditing ? "Mengaudit..." : "Jalankan Audit Kualitas"}
          </button>
        </div>
        {audit && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
            <AuditMetric label="Lulus" value={`${audit.passed}/${audit.total}`} tone="text-emerald-300" />
            <AuditMetric label="Pass rate" value={`${audit.passRate}%`} tone="text-indigo-300" />
            <AuditMetric label="Score" value={audit.averageScore} tone="text-fuchsia-300" />
            <AuditMetric label="Gagal" value={audit.failed} tone="text-rose-300" />
            <AuditMetric label="Warnings" value={audit.warnings} tone="text-amber-300" />
            <AuditMetric label="Errors" value={audit.errors} tone="text-rose-300" />
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-bold text-white">Sinkronisasi Data Aman</h3>
          <p className="mt-2 text-sm text-slate-400">
            Tombol ini mengisi kategori, paket, 70 prompt gratis, 1050 prompt premium, dan 50 prompt app builder jika masih kurang. Tidak melakukan truncate dan tidak menghapus prompt lama.
          </p>
          <button
            onClick={ensureSeed}
            disabled={seeding}
            className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {seeding ? "Menyinkronkan..." : "Pastikan Data Produksi Lengkap"}
          </button>
          {message && <p className="mt-3 text-sm text-indigo-200">{message}</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-bold text-white">Backup JSON</h3>
          <p className="mt-2 text-sm text-slate-400">
            Export semua kategori, paket, dan prompt ke file JSON. Simpan file ini sebagai backup berkala sebelum melakukan perubahan besar.
          </p>
          <button
            onClick={exportBackup}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
          >
            Export Backup JSON
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-bold text-white">Checklist Supabase Online</h3>
        <ol className="mt-4 space-y-2 text-sm text-slate-300">
          <li>1. Buat project di Supabase, buka <b>Project Settings → Database → Connection string</b>.</li>
          <li>2. Salin connection string PostgreSQL mode pooled/non-pooled.</li>
          <li>3. Set environment variable hosting: <code className="rounded bg-white/10 px-1">DATABASE_URL=postgresql://...</code>.</li>
          <li>4. Jalankan schema: <code className="rounded bg-white/10 px-1">npx drizzle-kit push</code> dari environment deploy/CI.</li>
          <li>5. Buka <b>/admin</b> → tab <b>Data & Supabase</b> → klik “Pastikan Data Produksi Lengkap”.</li>
          <li>6. Export backup JSON secara berkala.</li>
        </ol>
      </div>
    </div>
  );
}

function AuditMetric({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
      <p className={`text-lg font-black ${tone}`}>{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function Target({ label, current, target }: { label: string; current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const ok = current >= target;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={ok ? "text-emerald-400" : "text-amber-400"}>{current}/{target}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
        <div className={ok ? "h-full bg-emerald-500" : "h-full bg-amber-500"} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
