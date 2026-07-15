import Link from "next/link";
import { notFound } from "next/navigation";
import PromptForm from "@/components/PromptForm";
import AdminGuard from "@/components/admin/AdminGuard";
import { getAllCategories } from "@/lib/queries";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, rows] = await Promise.all([
    getAllCategories(),
    db.select().from(prompts).where(eq(prompts.id, Number(id))).limit(1),
  ]);
  const prompt = rows[0];
  if (!prompt) notFound();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
            <span>←</span> Kembali ke Control Panel
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Edit Prompt</h1>
          <p className="mt-1 text-sm text-slate-500">{prompt.title}</p>
          <div className="mt-8">
            <PromptForm categories={categories} initial={prompt} />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
