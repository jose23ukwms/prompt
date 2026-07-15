import type { prompts } from "@/db/schema";

export type PromptRow = typeof prompts.$inferSelect & {
  categoryName: string;
  categorySlug: string;
  categoryIcon: string;
  categoryColor: string;
};

export function avgRating(sum: number, count: number) {
  return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
}
