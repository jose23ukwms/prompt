import Link from "next/link";
import PromptCard from "@/components/PromptCard";
import Stars from "@/components/Stars";
import {
  getCategoriesWithCount,
  getPromptsByFlags,
  getStats,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const AIS = ["ChatGPT", "Claude", "Gemini", "Grok", "DeepSeek", "Copilot", "Perplexity"];

const FAQ = [
  {
    q: "Apa itu Start Digital AI Prompt Premium?",
    a: "Platform yang menyediakan ribuan prompt AI berkualitas tinggi siap pakai untuk bisnis, marketing, coding, desain, produktivitas, dan konten.",
  },
  {
    q: "Prompt ini bisa dipakai di AI mana saja?",
    a: "Semua prompt kompatibel dengan ChatGPT, Claude, Gemini, Grok, DeepSeek, Copilot, dan model AI berbasis teks lainnya.",
  },
  {
    q: "Apakah ada paket gratis?",
    a: "Ya. Pengunjung mendapat akses 70 prompt pilihan selama 7 hari pada perangkatnya, dengan copy maksimal 1x per prompt. Upgrade ke Premium untuk akses tanpa batas.",
  },
  {
    q: "Seberapa sering prompt diperbarui?",
    a: "Member Premium mendapatkan prompt baru setiap minggu, beserta template dan AI workflow terbaru.",
  },
];

const TESTIMONI = [
  { name: "Rina — Owner Skincare", text: "ROAS iklan naik drastis. Prompt marketing-nya benar-benar praktis.", rating: 5 },
  { name: "Dimas — Full Stack Dev", text: "Prompt coding-nya menghemat berjam-jam kerja. Code review-nya tajam.", rating: 5 },
  { name: "Sari — Fresh Graduate", text: "CV ATS-friendly-nya bikin aku langsung dipanggil interview.", rating: 5 },
];

export default async function Home() {
  const [categories, trending, latest, bestSeller, stats] = await Promise.all([
    getCategoriesWithCount(),
    getPromptsByFlags("trending", 6),
    getPromptsByFlags("terbaru", 6),
    getPromptsByFlags("bestseller", 3),
    getStats(),
  ]);

  return (
    <div>
      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-indigo-200">
            🚀 {stats.total}+ prompt siap pakai • diperbarui berkala
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Ribuan{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              Prompt AI
            </span>{" "}
            Siap Pakai
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Untuk Bisnis, Marketing, Coding, Desain, Produktivitas, dan Konten.
            Tinggal copy, tempel, dan jalankan di AI favoritmu.
          </p>

          <form action="/prompts" className="mx-auto mt-8 flex max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                name="q"
                placeholder="Cari prompt: meta ads, code review, cv..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <button className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3.5 text-sm font-semibold text-white">
              Cari
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Kompatibel dengan:</span>
            {AIS.map((a) => (
              <span
                key={a}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200"
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4">
          {[
            { label: "Total Prompt", value: `${stats.total}+` },
            { label: "Kali Digunakan", value: `${Math.round(stats.users / 1000)}k+` },
            { label: "Kategori", value: `${categories.length}` },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 text-center">
              <p className="text-2xl font-black text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KATEGORI */}
      <Section title="Kategori Prompt" subtitle="Temukan prompt sesuai kebutuhanmu" href="/kategori" cta="Semua kategori">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/prompts?category=${c.slug}`}
              className="card-hover rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div
                className="grid h-11 w-11 place-items-center rounded-xl text-xl"
                style={{ backgroundColor: `${c.color}22` }}
              >
                {c.icon}
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{c.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{c.count} prompt</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* TRENDING */}
      <Section title="🔥 Trending" subtitle="Prompt yang paling banyak dipakai minggu ini" href="/prompts?sort=populer" cta="Lihat semua">
        <Grid>
          {trending.map((p) => (
            <PromptCard key={p.id} p={p} />
          ))}
        </Grid>
      </Section>

      {/* BEST SELLER */}
      <Section title="⭐ Best Seller" subtitle="Favorit para pengguna" href="/prompts" cta="Jelajahi">
        <Grid>
          {bestSeller.map((p) => (
            <PromptCard key={p.id} p={p} />
          ))}
        </Grid>
      </Section>

      {/* TERBARU */}
      <Section title="🆕 Prompt Terbaru" subtitle="Baru ditambahkan ke koleksi" href="/prompts?sort=terbaru" cta="Lihat semua">
        <Grid>
          {latest.map((p) => (
            <PromptCard key={p.id} p={p} />
          ))}
        </Grid>
      </Section>

      {/* TESTIMONI */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Dipercaya ribuan pengguna
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONI.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6">
              <Stars value={t.rating} size="md" />
              <p className="mt-3 text-sm text-slate-300">&ldquo;{t.text}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-white">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Pertanyaan Umum
        </h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white">
                {f.q}
                <span className="text-indigo-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/30 via-fuchsia-600/20 to-slate-900 p-10 text-center sm:p-14">
          <h2 className="text-3xl font-black sm:text-4xl">
            Siap produktif dengan AI?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Buka akses ke semua prompt premium, template, dan AI workflow. Update
            selamanya.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/harga"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200"
            >
              Upgrade Premium
            </Link>
            <Link
              href="/prompts"
              className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Jelajahi Prompt Gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  href,
  cta,
  children,
}: {
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <Link href={href} className="shrink-0 text-sm font-medium text-indigo-300 hover:text-indigo-200">
          {cta} →
        </Link>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
