import Link from "next/link";
import PromptCard from "@/components/PromptCard";
import { getAllCategories, getPrompts, type PromptFilters } from "@/lib/queries";

export const dynamic = "force-dynamic";

const AIS = ["ChatGPT", "Claude", "Gemini", "Grok", "DeepSeek", "Copilot", "Midjourney"];
const SORTS: { value: string; label: string }[] = [
  { value: "populer", label: "Populer" },
  { value: "terbaru", label: "Terbaru" },
  { value: "rating", label: "Rating" },
];

type SP = Promise<Record<string, string | undefined>>;

export default async function PromptsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const filters: PromptFilters = {
    q: sp.q || undefined,
    category: sp.category || undefined,
    ai: sp.ai || undefined,
    access: (sp.access as "free" | "premium") || undefined,
    sort: (sp.sort as PromptFilters["sort"]) || "populer",
  };

  // Di server component, kita asumsikan user anonim kecuali ada sistem auth session.
  // Katalog publik sekarang terbuka untuk menampilkan kebesaran platform.
  // Kunci konten sebenarnya ada di halaman detail.
  const isPremium = false; 

  const [categories, results] = await Promise.all([
    getAllCategories(),
    getPrompts(filters, 1500, isPremium), // Ambil semua (up to 1500) agar terlihat masif
  ]);

  const build = (patch: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = {
      q: sp.q,
      category: sp.category,
      ai: sp.ai,
      access: sp.access,
      sort: sp.sort,
      ...patch,
    };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const s = params.toString();
    return s ? `/prompts?${s}` : "/prompts";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black">Jelajahi Prompt</h1>
      <p className="mt-1 text-slate-400">
        {results.length} prompt ditemukan {filters.q ? `untuk "${filters.q}"` : ""}
      </p>

      {/* Search */}
      <form action="/prompts" className="mt-6 flex gap-2">
        {filters.category && <input type="hidden" name="category" value={filters.category} />}
        {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Cari judul, deskripsi, atau tag..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <button className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold">
          Cari
        </button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="space-y-6">
          <FilterGroup title="Akses">
            <Chip href={build({ access: undefined })} active={!filters.access}>Semua</Chip>
            <Chip href={build({ access: "free" })} active={filters.access === "free"}>Gratis</Chip>
            <Chip href={build({ access: "premium" })} active={filters.access === "premium"}>Premium</Chip>
          </FilterGroup>

          <FilterGroup title="Urutkan">
            {SORTS.map((s) => (
              <Chip key={s.value} href={build({ sort: s.value })} active={filters.sort === s.value}>
                {s.label}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup title="Model AI">
            <Chip href={build({ ai: undefined })} active={!filters.ai}>Semua</Chip>
            {AIS.map((a) => (
              <Chip key={a} href={build({ ai: a })} active={filters.ai === a}>{a}</Chip>
            ))}
          </FilterGroup>

          <FilterGroup title="Kategori">
            <Chip href={build({ category: undefined })} active={!filters.category}>Semua</Chip>
            {categories.map((c) => (
              <Chip key={c.id} href={build({ category: c.slug })} active={filters.category === c.slug}>
                {c.icon} {c.name}
              </Chip>
            ))}
          </FilterGroup>
        </aside>

        {/* Results */}
        <div>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 font-semibold text-white">Tidak ada prompt yang cocok</p>
              <p className="mt-1 text-sm text-slate-400">Coba kata kunci atau filter lain.</p>
              <Link href="/prompts" className="mt-4 inline-block text-sm text-indigo-300">
                Reset filter →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <PromptCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
      }`}
    >
      {children}
    </Link>
  );
}
