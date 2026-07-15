import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import FavoriteButton from "@/components/FavoriteButton";
import PromptCard from "@/components/PromptCard";
import Stars from "@/components/Stars";
import ReviewForm from "@/components/ReviewForm";
import FollowUps from "@/components/FollowUps";
import PromptContent from "@/components/PromptContent";
import SidebarActions from "@/components/SidebarActions";
import PromptTroubleshooter from "@/components/PromptTroubleshooter";
import {
  avgRating,
  getPromptBySlug,
  getRelatedPrompts,
  getReviews,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PromptDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPromptBySlug(slug);
  if (!p) notFound();

  const [related, reviewList] = await Promise.all([
    getRelatedPrompts(p.categoryId, p.id, 3),
    getReviews(p.id),
  ]);

  const rating = avgRating(p.ratingSum, p.ratingCount);
  const updated = new Date(p.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">Beranda</Link>
        <span>/</span>
        <Link href={`/prompts?category=${p.categorySlug}`} className="hover:text-white">
          {p.categoryName}
        </Link>
        <span>/</span>
        <span className="text-slate-300 line-clamp-1">{p.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: `${p.categoryColor}22`, color: p.categoryColor }}
            >
              {p.categoryIcon} {p.categoryName}
            </span>
            {p.isPremium ? (
              <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[10px] font-bold text-slate-900">
                PREMIUM
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                GRATIS
              </span>
            )}
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-300">
              {p.level}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight">{p.title}</h1>
          <p className="mt-3 text-slate-300">{p.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Stars value={rating} /> {rating || "-"} ({p.ratingCount} ulasan)
            </span>
            <span>👥 {p.usersCount.toLocaleString("id-ID")} pengguna</span>
            <span>📋 {p.copyCount.toLocaleString("id-ID")} disalin</span>
          </div>

          {/* Prompt box */}
          <PromptContent isPremium={p.isPremium} promptId={p.id} />

          {/* Prompt lanjutan */}
          <FollowUps items={p.followUps} promptKey={p.id} />

          <PromptTroubleshooter title={p.title} categoryName={p.categoryName} />

          {/* Usage */}
          {p.usage && (
            <InfoBlock title="Cara Penggunaan" icon="📌">
              <p className="text-sm leading-relaxed text-slate-300">{p.usage}</p>
            </InfoBlock>
          )}

          {/* Example output */}
          {p.exampleOutput && (
            <InfoBlock title="Contoh Output" icon="💡">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {p.exampleOutput}
              </p>
            </InfoBlock>
          )}

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="text-xl font-bold">Ulasan & Rating</h2>
            <div className="mt-4 space-y-3">
              {reviewList.length === 0 && (
                <p className="text-sm text-slate-400">Belum ada ulasan. Jadilah yang pertama!</p>
              )}
              {reviewList.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{r.author}</span>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{r.comment}</p>
                  <p className="mt-2 text-xs text-slate-500">👍 {r.likes}</p>
                </div>
              ))}
            </div>
            <ReviewForm promptId={p.id} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <SidebarActions isPremium={p.isPremium} promptId={p.id} />

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">Detail</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Level" value={p.level} />
              <Row label="Bahasa" value={p.language} />
              <Row label="Versi" value={p.version} />
              <Row label="Diperbarui" value={updated} />
            </dl>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">AI yang Didukung</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.supportedAi.map((a) => (
                <span key={a} className="rounded-md border border-white/10 bg-slate-800/50 px-2 py-1 text-xs text-slate-300">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">Tag</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <Link
                  key={t}
                  href={`/prompts?q=${encodeURIComponent(t)}`}
                  className="rounded-md bg-white/5 px-2 py-1 text-xs text-indigo-300 hover:bg-white/10"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-2xl font-bold">Prompt Serupa</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <PromptCard key={r.id} p={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-200">{value}</dd>
    </div>
  );
}
