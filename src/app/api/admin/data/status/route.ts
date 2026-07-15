import { db } from "@/db";
import { categories, deviceTrials, plans, prompts } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const [stats] = await db
    .select({
      totalPrompts: sql<number>`count(*)`.mapWith(Number),
      freePrompts: sql<number>`count(*) filter (where ${prompts.isPremium} = false)`.mapWith(Number),
      premiumPrompts: sql<number>`count(*) filter (where ${prompts.isPremium} = true)`.mapWith(Number),
      appBuilderPrompts: sql<number>`count(*) filter (where ${prompts.slug} like 'app-%')`.mapWith(Number),
      gasPrompts: sql<number>`count(*) filter (where ${prompts.slug} like 'gas-%')`.mapWith(Number),
    })
    .from(prompts);

  const [trialStats] = await db
    .select({
      totalDevices: sql<number>`count(*)`.mapWith(Number),
      activeTrials: sql<number>`count(*) filter (where ${deviceTrials.expiresAt} > now() and ${deviceTrials.blockedAt} is null)`.mapWith(Number),
      expiredTrials: sql<number>`count(*) filter (where ${deviceTrials.expiresAt} <= now() or ${deviceTrials.blockedAt} is not null)`.mapWith(Number),
    })
    .from(deviceTrials);

  const [catCount] = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(categories);
  const [planCount] = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(plans);

  return Response.json({
    ok: true,
    database: "connected",
    stats: {
      categories: catCount.count,
      plans: planCount.count,
      ...stats,
      ...trialStats,
    },
    target: {
      freePrompts: 70,
      premiumPrompts: 1130,
      appBuilderPrompts: 50,
      gasPrompts: 80,
      totalPrompts: 1200,
    },
  });
}
