import { db } from "@/db";
import { reviews, prompts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { promptId, author, rating, comment } = await req.json();
  if (!promptId || !comment) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const r = Math.max(1, Math.min(5, Number(rating) || 5));

  await db.insert(reviews).values({
    promptId: Number(promptId),
    author: (author || "Anonim").slice(0, 120),
    rating: r,
    comment: String(comment).slice(0, 1000),
  });

  await db
    .update(prompts)
    .set({
      ratingSum: sql`${prompts.ratingSum} + ${r}`,
      ratingCount: sql`${prompts.ratingCount} + 1`,
    })
    .where(eq(prompts.id, Number(promptId)));

  return Response.json({ ok: true });
}
