"use client";

import Link from "next/link";
import { useState } from "react";

type Result = {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  isPremium: boolean;
  supportedAi: string[];
  usage: string;
  reason: string;
};

const SUGGESTIONS = [
  "Saya ingin iklan Meta Ads untuk bisnis skincare",
  "Butuh prompt untuk review kode React saya",
  "Bantu buat CV yang lolos ATS",
  "Prompt konten carousel Instagram untuk UMKM",
];

export default function AsistenPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [intro, setIntro] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searched, setSearched] = useState(false);

  async function ask(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/asisten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setIntro(data.intro || "");
      setResults(data.results || []);
    } catch {
      setIntro("Terjadi kesalahan. Coba lagi.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-indigo-200">
          🤖 AI Asisten Prompt
        </span>
        <h1 className="mt-5 text-4xl font-black">Ceritakan kebutuhanmu</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Jelaskan apa yang ingin kamu capai, dan asisten kami akan
          merekomendasikan prompt terbaik beserta cara menggunakannya.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(query);
        }}
        className="mt-8"
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder="Contoh: Saya ingin iklan Meta Ads untuk bisnis skincare..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
        />
        <button
          disabled={loading}
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Menganalisis..." : "✨ Rekomendasikan Prompt"}
        </button>
      </form>

      {!searched && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                ask(s);
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-400"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {intro && (
        <div className="mt-10 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-5">
          <p className="text-sm text-indigo-100">{intro}</p>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {results.map((r) => (
          <div key={r.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">{r.icon} {r.category}</p>
                <Link href={`/prompt/${r.slug}`} className="mt-1 block text-lg font-bold text-white hover:text-indigo-300">
                  {r.title}
                </Link>
              </div>
              {r.isPremium ? (
                <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-slate-900">PREMIUM</span>
              ) : (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">GRATIS</span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-300">{r.description}</p>
            <div className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-300">
              <span className="font-semibold text-indigo-300">💡 Kenapa cocok: </span>
              {r.reason}
            </div>
            <div className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-300">
              <span className="font-semibold text-indigo-300">📌 Cara pakai: </span>
              {r.usage}
            </div>
            <Link
              href={`/prompt/${r.slug}`}
              className="mt-3 inline-block text-sm font-medium text-indigo-300 hover:text-indigo-200"
            >
              Buka & Copy Prompt →
            </Link>
          </div>
        ))}
        {searched && !loading && results.length === 0 && (
          <p className="text-center text-sm text-slate-400">
            Belum ada hasil. Coba kata kunci lain.
          </p>
        )}
      </div>
    </div>
  );
}
