import Link from "next/link";
import PromptForm from "@/components/PromptForm";
import AdminGuard from "@/components/admin/AdminGuard";
import { getAllCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewPromptPage() {
  const categories = await getAllCategories();
  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
            <span>←</span> Kembali ke Control Panel
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Tambah Prompt Baru</h1>
          <p className="mt-1 text-sm text-slate-500">Lengkapi detail prompt untuk dipublikasikan.</p>
          <div className="mt-8">
            <PromptForm categories={categories} />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
