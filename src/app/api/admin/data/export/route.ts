import { db } from "@/db";
import { categories, plans, prompts } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const [cats, planRows, promptRows] = await Promise.all([
    db.select().from(categories),
    db.select().from(plans),
    db.select().from(prompts),
  ]);

  return Response.json({
    exportedAt: new Date().toISOString(),
    app: "Start Digital AI Prompt Premium",
    counts: {
      categories: cats.length,
      plans: planRows.length,
      prompts: promptRows.length,
      freePrompts: promptRows.filter((p) => !p.isPremium).length,
      premiumPrompts: promptRows.filter((p) => p.isPremium).length,
    },
    categories: cats,
    plans: planRows,
    prompts: promptRows,
  });
}
