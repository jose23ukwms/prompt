import Link from "next/link";
import { getCategoriesWithCount } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  const categories = await getCategoriesWithCount();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-black">Semua Kategori</h1>
      <p className="mt-1 text-slate-400">
        Jelajahi prompt berdasarkan kebutuhanmu.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/prompts?category=${c.slug}`}
            className="card-hover rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div
              className="grid h-14 w-14 place-items-center rounded-2xl text-2xl"
              style={{ backgroundColor: `${c.color}22` }}
            >
              {c.icon}
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">{c.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{c.description}</p>
            <p className="mt-4 text-xs font-medium text-indigo-300">
              {c.count} prompt →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
