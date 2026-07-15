import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 190);
}

function normalize(body: Record<string, unknown>) {
  const toArr = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.map(String)
      : String(v || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  // Follow-ups dipisah baris baru (satu langkah per baris)
  const toLines = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.map(String)
      : String(v || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
  return {
    title: String(body.title || "").slice(0, 240),
    description: String(body.description || ""),
    categoryId: Number(body.categoryId),
    content: String(body.content || ""),
    usage: String(body.usage || ""),
    exampleOutput: String(body.exampleOutput || ""),
    level: String(body.level || "Pemula"),
    language: String(body.language || "Indonesia"),
    supportedAi: toArr(body.supportedAi),
    tags: toArr(body.tags),
    followUps: toLines(body.followUps),
    isPremium: Boolean(body.isPremium),
    isTrending: Boolean(body.isTrending),
    isBestSeller: Boolean(body.isBestSeller),
    version: String(body.version || "1.0"),
  };
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = normalize(body);
  if (!data.title || !data.content || !data.categoryId) {
    return Response.json({ ok: false, error: "Judul, konten, dan kategori wajib." }, { status: 400 });
  }
  const slug = slugify(data.title) + "-" + Date.now().toString(36).slice(-4);
  const [row] = await db
    .insert(prompts)
    .values({ ...data, slug })
    .returning({ id: prompts.id, slug: prompts.slug });
  return Response.json({ ok: true, prompt: row });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const id = Number(body.id);
  if (!id) return Response.json({ ok: false, error: "ID wajib." }, { status: 400 });
  const data = normalize(body);
  await db
    .update(prompts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(prompts.id, id));
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return Response.json({ ok: false }, { status: 400 });
  await db.delete(prompts).where(eq(prompts.id, Number(id)));
  return Response.json({ ok: true });
}
