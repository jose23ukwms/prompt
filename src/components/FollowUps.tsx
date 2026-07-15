"use client";

import { useEffect, useMemo, useState } from "react";

function buildRunnableStep(step: string, previousOutput: string) {
  if (!previousOutput.trim()) return step;
  return `${step}\n\nOUTPUT LANGKAH SEBELUMNYA:\n${previousOutput.trim()}\n\nGunakan output tersebut sebagai konteks. Jangan mengulang pekerjaan yang sudah benar; perbaiki hanya gap yang ditemukan dan berikan hasil final yang dapat diverifikasi.`;
}

export default function FollowUps({
  items,
  promptKey = "prompt",
}: {
  items: string[];
  promptKey?: string | number;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [previousOutput, setPreviousOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const storageKey = `sd_followup_workflow_${promptKey}`;
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const current = safeItems[active] ?? safeItems[0] ?? "";
  const runnable = buildRunnableStep(current, previousOutput);
  const progress = safeItems.length ? Math.round((completed.length / safeItems.length) * 100) : 0;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved) as { active?: number; completed?: number[]; output?: string };
        setActive(Math.min(data.active ?? 0, Math.max(0, safeItems.length - 1)));
        setCompleted(data.completed ?? []);
        setPreviousOutput(data.output ?? "");
      }
    } catch {
      /* ignore malformed local progress */
    }
  }, [storageKey, safeItems.length]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ active, completed, output: previousOutput }));
    } catch {
      /* ignore storage restrictions */
    }
  }, [storageKey, active, completed, previousOutput]);

  if (!safeItems.length) return null;

  async function copyAndAdvance(index = active) {
    const text = buildRunnableStep(safeItems[index], previousOutput);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      setCompleted((old) => (old.includes(index) ? old : [...old, index]));
      if (index < safeItems.length - 1) setActive(index + 1);
    } catch {
      /* ignore clipboard error */
    }
  }

  function resetWorkflow() {
    setActive(0);
    setCompleted([]);
    setPreviousOutput("");
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.08] to-transparent">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/20 text-lg">🪜</span>
          <div>
            <h2 className="text-sm font-bold text-white">
              Workflow Prompt Lanjutan{" "}
              <span className="ml-1 rounded-full bg-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">
                {safeItems.length} tahap
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Otomatis meneruskan konteks, menandai progres, dan mengarahkan ke quality gate berikutnya.
            </p>
          </div>
        </div>
        <span className={`text-indigo-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-5 border-t border-white/5 px-5 pb-5 pt-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-200">Progress workflow</span>
                <span className="text-slate-400">{completed.length}/{safeItems.length} selesai · {progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-400/30 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Tahap {active + 1}</p>
                  <h3 className="mt-1 text-sm font-bold text-white">Langkah aktif untuk output yang lebih baik</h3>
                </div>
                <button onClick={resetWorkflow} className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] text-slate-400 hover:text-white">Reset workflow</button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{current}</p>
              <div className="mt-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tempel output AI sebelumnya (opsional)</label>
                <textarea
                  value={previousOutput}
                  onChange={(e) => setPreviousOutput(e.target.value)}
                  rows={3}
                  placeholder="Tempel jawaban dari langkah sebelumnya agar langkah aktif otomatis mendapat konteks..."
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => copyAndAdvance(active)}
                className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold transition ${copied ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90"}`}
              >
                {copied ? "✓ Tersalin — lanjutkan ke tahap berikutnya" : "Salin tahap aktif & lanjut otomatis →"}
              </button>
              {previousOutput && <p className="mt-2 text-[11px] text-indigo-200">Output akan ikut ditempel ke prompt saat disalin.</p>}
              <details className="mt-3 rounded-xl border border-white/5 bg-black/20 p-3">
                <summary className="cursor-pointer text-[11px] font-semibold text-slate-400">Lihat prompt siap jalan</summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300">{runnable}</pre>
              </details>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {safeItems.map((step, i) => (
                <button
                  key={`${i}-${step.slice(0, 15)}`}
                  onClick={() => setActive(i)}
                  className={`flex items-start gap-2 rounded-xl border p-3 text-left transition ${active === i ? "border-indigo-400/50 bg-indigo-500/10" : "border-white/5 bg-slate-950/30 hover:border-white/15"}`}
                >
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${completed.includes(i) ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300"}`}>
                    {completed.includes(i) ? "✓" : i + 1}
                  </span>
                  <span className="line-clamp-2 text-xs text-slate-300">{step}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
