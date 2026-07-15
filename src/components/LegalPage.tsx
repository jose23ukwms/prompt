import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <nav className="mb-8 text-sm text-slate-500">
        <Link href="/" className="hover:text-white">Beranda</Link> <span className="mx-2">/</span> {title}
      </nav>
      <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/[0.1] to-fuchsia-500/[0.05] p-7 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">{description}</p>
        <p className="mt-5 text-xs text-slate-500">Terakhir diperbarui: {updated} · Versi 2026-07-05</p>
      </header>
      <article className="mt-8 space-y-7 rounded-3xl border border-white/10 bg-white/[0.025] p-6 text-sm leading-7 text-slate-300 sm:p-9">
        {children}
      </article>
      <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-5 text-xs leading-relaxed text-amber-100/80">
        Dokumen ini disusun untuk operasional platform digital dan bukan pengganti nasihat hukum profesional. Pemilik dianjurkan meminta peninjauan konsultan hukum Indonesia sebelum peluncuran komersial skala besar.
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 marker:text-indigo-400">
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
  );
}
