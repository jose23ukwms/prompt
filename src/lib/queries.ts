import { db } from "@/db";
import { categories, prompts, reviews } from "@/db/schema";
import { and, desc, eq, ilike, or, sql, inArray, type SQL } from "drizzle-orm";
import { avgRating, type PromptRow } from "@/lib/types";

export { avgRating };
export type { PromptRow };

function withCategory() {
  return db
    .select({
      id: prompts.id,
      slug: prompts.slug,
      title: prompts.title,
      description: prompts.description,
      categoryId: prompts.categoryId,
      content: prompts.content,
      usage: prompts.usage,
      exampleOutput: prompts.exampleOutput,
      level: prompts.level,
      language: prompts.language,
      supportedAi: prompts.supportedAi,
      tags: prompts.tags,
      followUps: prompts.followUps,
      isPremium: prompts.isPremium,
      isTrending: prompts.isTrending,
      isBestSeller: prompts.isBestSeller,
      usersCount: prompts.usersCount,
      copyCount: prompts.copyCount,
      ratingSum: prompts.ratingSum,
      ratingCount: prompts.ratingCount,
      version: prompts.version,
      createdAt: prompts.createdAt,
      updatedAt: prompts.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(prompts)
    .innerJoin(categories, eq(prompts.categoryId, categories.id));
}

export async function getAllCategories() {
  return db.select().from(categories).orderBy(categories.id);
}

export async function getCategoriesWithCount() {
  const rows = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      icon: categories.icon,
      color: categories.color,
      count: sql<number>`count(${prompts.id})`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(prompts, eq(prompts.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.id);
  return rows;
}

export type PromptFilters = {
  q?: string;
  category?: string;
  ai?: string;
  access?: "free" | "premium";
  sort?: "populer" | "terbaru" | "rating";
};

export async function getPrompts(
  filters: PromptFilters = {},
  limit = 100, // Tampilkan lebih banyak per halaman
  isPremiumUser = false
): Promise<PromptRow[]> {
  const conds: SQL[] = [];

  // PENTING: Pembatasan limit = 70 sebelumnya dihapus agar katalog
  // tetap terlihat penuh dan masif (menampilkan 1250+ prompt).
  // Proteksi konten Premium tetap aman karena di-handle di halaman Detail Prompt.

  if (filters.q) {
    const like = `%${filters.q}%`;
    conds.push(
      or(
        ilike(prompts.title, like),
        ilike(prompts.description, like),
        sql`${prompts.tags}::text ILIKE ${like}`
      )!
    );
  }
  if (filters.category) conds.push(eq(categories.slug, filters.category));

  // User gratis tidak bisa filter 'premium' secara eksplisit
  if (filters.access === "premium" && !isPremiumUser) {
    conds.push(eq(prompts.isPremium, false));
  } else if (filters.access === "free") {
    conds.push(eq(prompts.isPremium, false));
  } else if (filters.access === "premium") {
    conds.push(eq(prompts.isPremium, true));
  }

  if (filters.ai)
    conds.push(
      sql`${prompts.supportedAi}::text ILIKE ${`%${filters.ai}%`}`
    );

  let order;
  if (filters.sort === "terbaru") order = desc(prompts.createdAt);
  else if (filters.sort === "rating")
    order =
      desc(sql`case when ${prompts.ratingCount} > 0 then ${prompts.ratingSum}::float / ${prompts.ratingCount} else 0 end`);
  else order = desc(prompts.usersCount);

  const query = withCategory().$dynamic();
  if (conds.length) query.where(and(...conds));
  return query.orderBy(order).limit(limit);
}

export async function getPromptBySlug(slug: string): Promise<PromptRow | null> {
  const rows = await withCategory().where(eq(prompts.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getRelatedPrompts(categoryId: number, excludeId: number, limit = 3) {
  return withCategory()
    .where(and(eq(prompts.categoryId, categoryId), sql`${prompts.id} <> ${excludeId}`))
    .orderBy(desc(prompts.usersCount))
    .limit(limit);
}

export async function getPromptsByFlags(flag: "trending" | "bestseller" | "terbaru", limit = 6) {
  const q = withCategory().$dynamic();
  if (flag === "trending") q.where(eq(prompts.isTrending, true)).orderBy(desc(prompts.usersCount));
  else if (flag === "bestseller") q.where(eq(prompts.isBestSeller, true)).orderBy(desc(prompts.copyCount));
  else q.orderBy(desc(prompts.createdAt));
  return q.limit(limit);
}

export async function getReviews(promptId: number) {
  return db.select().from(reviews).where(eq(reviews.promptId, promptId)).orderBy(desc(reviews.createdAt));
}

export async function getPromptsByIds(ids: number[]): Promise<PromptRow[]> {
  if (!ids.length) return [];
  return withCategory().where(inArray(prompts.id, ids));
}

export async function getStats() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
      free: sql<number>`count(*) filter (where ${prompts.isPremium} = false)`.mapWith(Number),
      premium: sql<number>`count(*) filter (where ${prompts.isPremium} = true)`.mapWith(Number),
      users: sql<number>`coalesce(sum(${prompts.usersCount}),0)`.mapWith(Number),
      copies: sql<number>`coalesce(sum(${prompts.copyCount}),0)`.mapWith(Number),
    })
    .from(prompts);
  return row;
}
