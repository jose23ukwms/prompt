"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

const ISSUES = [
  {
    id: "generic",
    label: "Hasil terlalu umum",
    hint: "AI memberi jawaban generik dan belum spesifik ke kebutuhan saya.",
  },
  {
    id: "long",
    label: "Terlalu panjang / bertele-tele",
    hint: "Jawaban perlu dipangkas jadi lebih ringkas dan langsung ke inti.",
  },
  {
    id: "tone",
    label: "Tone bahasa tidak sesuai",
    hint: "Nada jawaban tidak cocok dengan target audiens atau brand saya.",
  },
  {
    id: "format",
    label: "Format output tidak konsisten",
    hint: "Struktur hasil sering berubah dan tidak mengikuti format yang saya mau.",
  },
  {
    id: "context",
    label: "Kurang konteks / data",
    hint: "AI butuh konteks tambahan agar hasilnya lebih akurat.",
  },
  {
    id: "hallucination",
    label: "AI menebak / terlalu berasumsi",
    hint: "Jawaban perlu dibatasi hanya berdasarkan data yang saya berikan.",
  },
  {
    id: "actionable",
    label: "Kurang actionable",
    hint: "Saya butuh langkah praktis, checklist, atau contoh implementasi.",
  },
] as const;

function inferPersona(categoryName: string, title: string) {
  const c = categoryName.toLowerCase();
  const t = title.toLowerCase();
  if (c.includes("coding") || t.includes("react") || t.includes("next.js") || t.includes("node")) return "senior software engineer";
  if (c.includes("marketing") || t.includes("ads") || t.includes("copy")) return "copywriter senior dan marketing strategist";
  if (c.includes("ui") || c.includes("ux") || t.includes("dashboard") || t.includes("landing")) return "UI/UX designer senior";
  if (c.includes("bisnis") || t.includes("business") || t.includes("proposal")) return "konsultan bisnis";
  if (c.includes("customer") || t.includes("reply") || t.includes("closing")) return "customer success specialist";
  if (c.includes("pendidikan") || c.includes("education") || t.includes("essay") || t.includes("skripsi")) return "asisten akademik";
  return "ahli yang berpengalaman";
}

function issueToFix(issueId: string) {
  switch (issueId) {
    case "generic":
      return "Tambahkan konteks yang lebih spesifik, target audiens, tujuan utama, dan contoh output yang diharapkan.";
    case "long":
      return "Batasi jawaban menjadi ringkas, gunakan maksimal beberapa poin utama, dan fokus ke hasil yang bisa langsung dipakai.";
    case "tone":
      return "Tentukan tone secara eksplisit, beri contoh gaya bahasa yang diinginkan, dan sebutkan apa yang harus dihindari.";
    case "format":
      return "Paksa output mengikuti skema yang jelas (judul, poin, tabel, langkah, atau JSON) dan larang format lain.";
    case "context":
      return "Sertakan data penting, asumsi yang valid, batasan, serta pertanyaan klarifikasi bila informasi belum cukup.";
    case "hallucination":
      return "Instruksikan AI untuk hanya memakai data yang diberikan, menyebutkan bila ada informasi yang kurang, dan tidak mengarang fakta.";
    case "actionable":
      return "Minta output berupa langkah praktis, checklist, contoh implementasi, dan prioritas tindakan yang jelas.";
    default:
      return "Perjelas tujuan, konteks, format, dan batasan output.";
  }
}

function buildRepairPrompt({
  title,
  categoryName,
  issue,
  notes,
}: {
  title: string;
  categoryName: string;
  issue: string;
  notes: string;
}) {
  const persona = inferPersona(categoryName, title);
  const fix = issueToFix(issue);

  return `Kamu adalah ${persona} dengan pengalaman tinggi di bidang ${categoryName}.

Tugas utama: ${title}

Masalah yang saya hadapi: ${ISSUES.find((i) => i.id === issue)?.label || "Belum ditentukan"}.
Detail masalah: ${notes || "(tidak ada detail tambahan)"}

Instruksi perbaikan:
- ${fix}
- Jika informasi kurang, ajukan maksimal 3 pertanyaan klarifikasi terlebih dahulu.
- Berikan jawaban yang benar-benar siap pakai, bukan jawaban umum.
- Pastikan output mengikuti format yang saya minta sebelumnya.
- Tambahkan bagian "quality check" singkat untuk memastikan hasil akhir sesuai tujuan.

Output final harus langsung bisa disalin dan digunakan.`;
}

export default function PromptTroubleshooter({
  title,
  categoryName,
  defaultIssue = "generic",
}: {
  title: string;
  categoryName: string;
  defaultIssue?: string;
}) {
  const [issue, setIssue] = useState(defaultIssue);
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [access, setAccess] = useState<{ checked: boolean; isPremium: boolean }>({
    checked: false,
    isPremium: false,
  });

  const repairedPrompt = useMemo(
    () => buildRepairPrompt({ title, categoryName, issue, notes }),
    [title, categoryName, issue, notes]
  );

  // Cek akses premium saat mount
  useEffect(() => {
    const email =
      typeof window !== "undefined"
        ? localStorage.getItem("sd_user_email")
        : null;
    if (!email) {
      setAccess({ checked: true, isPremium: false });
      return;
    }
    fetch(`/api/auth/access?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => setAccess({ checked: true, isPremium: !!d.isPremium }))
      .catch(() => setAccess({ checked: true, isPremium: false }));
  }, []);

  async function copy() {
    if (!access.isPremium) return;
    try {
      await navigator.clipboard.writeText(repairedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  // Loading state - jangan render apa-apa dulu sebelum status akses jelas
  if (!access.checked) {
    return (
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
      </section>
    );
  }

  // GATE: User gratis → tampilkan versi terkunci
  if (!access.isPremium) {
    return (
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[0.08] via-indigo-500/[0.05] to-transparent">
        {/* Blur content di belakang overlay */}
        <div className="pointer-events-none select-none blur-md opacity-60" aria-hidden>
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="text-sm font-bold text-white">Prompt Troubleshooter</h2>
            <p className="mt-1 text-xs text-slate-400">
              Pilih masalah utama dan tambahkan catatan untuk menghasilkan prompt perbaikan adaptif.
            </p>
          </div>
          <div className="grid gap-5 p-5 lg:grid-cols-[260px_1fr]">
            <div className="space-y-2">
              {ISSUES.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{item.hint}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="h-3 w-32 rounded bg-white/5" />
              <div className="mt-3 space-y-2">
                <div className="h-2 w-full rounded bg-white/5" />
                <div className="h-2 w-5/6 rounded bg-white/5" />
                <div className="h-2 w-4/6 rounded bg-white/5" />
              </div>
            </div>
          </div>
        </div>

        {/* Overlay lock */}
        <div className="absolute inset-0 grid place-items-center bg-slate-950/70 backdrop-blur-[2px] p-6">
          <div className="max-w-md text-center">
            <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-lg shadow-amber-500/30">
              🔒
            </span>
            <h3 className="mt-4 text-xl font-bold text-white">
              Fitur Premium: Prompt Troubleshooter
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Troubleshooter adalah alat diagnosis adaptif untuk memperbaiki prompt ketika hasil
              AI berulang kali tidak sesuai. Fitur ini hanya tersedia untuk member Premium.
            </p>
            <div className="mt-5 grid gap-2 text-left text-xs text-slate-300">
              <p className="flex gap-2"><span className="text-emerald-400">✓</span> Diagnosis 7 jenis masalah AI secara otomatis</p>
              <p className="flex gap-2"><span className="text-emerald-400">✓</span> Generate prompt perbaikan sesuai kategori</p>
              <p className="flex gap-2"><span className="text-emerald-400">✓</span> Role inference & quality-check built-in</p>
              <p className="flex gap-2"><span className="text-emerald-400">✓</span> Copy prompt hasil diagnosis tanpa batas</p>
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <Link
                href="/harga"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90"
              >
                Upgrade Premium
              </Link>
              <Link
                href="/masuk"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Saya Sudah Member
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // User premium → render normal
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[0.08] via-indigo-500/[0.05] to-transparent">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Prompt Troubleshooter</h2>
            <p className="mt-1 text-xs text-slate-400">
              Kalau hasil masih tidak sejalan setelah 2–3 kali follow-up, lakukan diagnosis lalu buat versi prompt yang diperbaiki.
            </p>
          </div>
          <button
            onClick={copy}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {copied ? "✓ Prompt Perbaikan Tersalin" : "Salin Prompt Perbaikan"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[260px_1fr]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pilih masalah utama
          </p>
          <div className="flex flex-wrap gap-2 lg:flex-col">
            {ISSUES.map((item) => {
              const active = issue === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setIssue(item.id)}
                  className={`rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-fuchsia-400/50 bg-fuchsia-500/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{item.hint}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Catatan tambahan
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Contoh: Saya ingin tone lebih persuasif, targetnya owner skincare, dan output harus dalam bahasa Indonesia santai."
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-400 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Prompt hasil diagnosis</h3>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                Adaptive Repair
              </span>
            </div>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-xs leading-relaxed text-slate-200">
              {repairedPrompt}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
