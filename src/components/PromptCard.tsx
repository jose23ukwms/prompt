import Link from "next/link";
import Stars from "./Stars";
import FavoriteButton from "./FavoriteButton";
import { avgRating, type PromptRow } from "@/lib/types";

export default function PromptCard({ p }: { p: PromptRow }) {
  const rating = avgRating(p.ratingSum, p.ratingCount);
  return (
    <div className="card-hover group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: `${p.categoryColor}22`, color: p.categoryColor }}
        >
          {p.categoryIcon} {p.categoryName}
        </span>
        <div className="flex items-center gap-1">
          {p.isPremium ? (
            <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-slate-900">
              PREMIUM
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              GRATIS
            </span>
          )}
          <FavoriteButton promptId={p.id} compact />
        </div>
      </div>

      <Link href={`/prompt/${p.slug}`} className="flex-1">
        <h3 className="text-base font-semibold leading-snug text-white group-hover:text-indigo-300">
          {p.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">{p.description}</p>
      </Link>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {p.supportedAi.slice(0, 3).map((a) => (
          <span
            key={a}
            className="rounded-md border border-white/10 bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-300"
          >
            {a}
          </span>
        ))}
        {p.supportedAi.length > 3 && (
          <span className="text-[10px] text-slate-500">+{p.supportedAi.length - 3}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Stars value={rating} />
          <span>{rating || "-"}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>👥 {formatNum(p.usersCount)}</span>
          <span>📋 {formatNum(p.copyCount)}</span>
        </div>
      </div>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}
