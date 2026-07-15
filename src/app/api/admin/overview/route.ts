import {
  getStats,
  getCategoriesWithCount,
  getPrompts,
  avgRating,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const [stats, categories, list] = await Promise.all([
    getStats(),
    getCategoriesWithCount(),
    getPrompts({ sort: "populer" }, 300),
  ]);

  const prompts = list.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    categoryName: p.categoryName,
    categoryIcon: p.categoryIcon,
    isPremium: p.isPremium,
    rating: avgRating(p.ratingSum, p.ratingCount),
    usersCount: p.usersCount,
    copyCount: p.copyCount,
  }));

  const topCategories = [...categories]
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      count: c.count,
    }));

  return Response.json({ stats, prompts, topCategories });
}
