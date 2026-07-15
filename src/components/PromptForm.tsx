"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, Prompt } from "@/db/schema";

const LEVELS = ["Pemula", "Menengah", "Lanjutan"];

export default function PromptForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Prompt;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? 0,
    content: initial?.content ?? "",
    usage: initial?.usage ?? "",
    exampleOutput: initial?.exampleOutput ?? "",
    level: initial?.level ?? "Pemula",
    language: initial?.language ?? "Indonesia",
    supportedAi: (initial?.supportedAi ?? ["ChatGPT", "Claude", "Gemini"]).join(", "),
    tags: (initial?.tags ?? []).join(", "),
    followUps: (initial?.followUps ?? []).join("\n"),
    version: initial?.version ?? "1.0",
    isPremium: initial?.isPremium ?? false,
    isTrending: initial?.isTrending ?? false,
    isBestSeller: initial?.isBestSeller ?? false,
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/prompts", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, id: initial?.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <Field label="Judul *">
        <input value={f.title} onChange={(e) => set("title", e.target.value)} className={inputCls} required />
      </Field>

      <Field label="Deskripsi">
        <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={2} className={inputCls} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Kategori *">
          <select value={f.categoryId} onChange={(e) => set("categoryId", Number(e.target.value))} className={inputCls}>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.icon} {c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Level">
          <select value={f.level} onChange={(e) => set("level", e.target.value)} className={inputCls}>
            {LEVELS.map((l) => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Prompt Lengkap *">
        <textarea value={f.content} onChange={(e) => set("content", e.target.value)} rows={6} className={`${inputCls} font-mono`} required />
      </Field>

      <Field label="Cara Penggunaan">
        <textarea value={f.usage} onChange={(e) => set("usage", e.target.value)} rows={2} className={inputCls} />
      </Field>

      <Field label="Contoh Output">
        <textarea value={f.exampleOutput} onChange={(e) => set("exampleOutput", e.target.value)} rows={2} className={inputCls} />
      </Field>

      <Field label="Prompt Lanjutan (satu langkah per baris)">
        <textarea
          value={f.followUps}
          onChange={(e) => set("followUps", e.target.value)}
          rows={4}
          placeholder={"Buat 3 variasi alternatif...\nKritik hasil di atas lalu perbaiki...\nSesuaikan untuk format mobile..."}
          className={inputCls}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="AI Didukung (pisah koma)">
          <input value={f.supportedAi} onChange={(e) => set("supportedAi", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Tag (pisah koma)">
          <input value={f.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Bahasa">
          <input value={f.language} onChange={(e) => set("language", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Versi">
          <input value={f.version} onChange={(e) => set("version", e.target.value)} className={inputCls} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4">
        <Check label="Premium" checked={f.isPremium} onChange={(v) => set("isPremium", v)} />
        <Check label="Trending" checked={f.isTrending} onChange={(v) => set("isTrending", v)} />
        <Check label="Best Seller" checked={f.isBestSeller} onChange={(v) => set("isBestSeller", v)} />
      </div>

      <div className="flex gap-3">
        <button disabled={loading} className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold disabled:opacity-50">
          {loading ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Buat Prompt"}
        </button>
        <button type="button" onClick={() => router.push("/admin")} className="rounded-xl border border-white/15 px-6 py-3 text-sm font-medium hover:bg-white/10">
          Batal
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-indigo-500" />
      {label}
    </label>
  );
}
