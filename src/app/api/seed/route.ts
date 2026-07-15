import { db } from "@/db";
import { categories, prompts, reviews, plans, profiles, orders, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  categoriesSeed,
  promptsSeed,
  plansSeed,
  reviewsSeed,
  universalFollowUps,
} from "@/db/seed-data";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // 1. Seed Categories
    const existingCats = await db.select({ id: categories.id }).from(categories).limit(1);
    const catMap = new Map<string, number>();
    
    if (existingCats.length === 0) {
      for (const c of categoriesSeed) {
        const [row] = await db.insert(categories).values(c).returning({ id: categories.id, slug: categories.slug });
        catMap.set(row.slug, row.id);
      }
    } else {
      const allCats = await db.select().from(categories);
      allCats.forEach(c => catMap.set(c.slug, c.id));
    }

    // 2. Seed Plans
    const existingPlans = await db.select({ id: plans.id }).from(plans).limit(1);
    if (existingPlans.length === 0) {
      for (const pl of plansSeed) {
        await db.insert(plans).values(pl);
      }
    }

    // 3. Seed Original 24 Prompts (if table is completely empty)
    const existingPrompts = await db.select({ id: prompts.id }).from(prompts).limit(1);
    if (existingPrompts.length === 0) {
      const promptMap = new Map<string, number>();
      for (const p of promptsSeed) {
        const ratingCount = Math.floor(p.usersCount / 40) + 5;
        const ratingSum = Math.round(ratingCount * (4.4 + Math.random() * 0.5));
        const [row] = await db
          .insert(prompts)
          .values({
            slug: p.slug,
            title: p.title,
            description: p.description,
            categoryId: catMap.get(p.category)!,
            content: p.content,
            usage: p.usage,
            exampleOutput: p.exampleOutput,
            level: p.level,
            supportedAi: p.supportedAi,
            tags: p.tags,
            followUps: p.followUps ?? universalFollowUps,
            isPremium: p.isPremium,
            isTrending: p.isTrending ?? false,
            isBestSeller: p.isBestSeller ?? false,
            usersCount: p.usersCount,
            copyCount: p.copyCount,
            ratingCount,
            ratingSum,
          })
          .returning({ id: prompts.id, slug: prompts.slug });
        promptMap.set(row.slug, row.id);
      }

      for (const r of reviewsSeed) {
        const pid = promptMap.get(r.promptSlug);
        if (pid) {
          await db.insert(reviews).values({
            promptId: pid,
            author: r.author,
            rating: r.rating,
            comment: r.comment,
            likes: r.likes,
          });
        }
      }
    }

    // 4. Seed Admin Profile
    const existingProfile = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, "budi@example.com")).limit(1);
    
    if (existingProfile.length === 0) {
      const [user1] = await db.insert(profiles).values({
        email: "budi@example.com",
        name: "Budi Santoso",
        phone: "081234567890",
        role: "superadmin",
        planSlug: "free",
        status: "active"
      }).returning();
  
      const [planPro] = await db.select().from(plans).where(eq(plans.slug, "pro-bulanan")).limit(1);
      
      if (planPro) {
        await db.insert(orders).values({
          profileId: user1.id,
          planId: planPro.id,
          amount: planPro.price,
          status: "pending"
        });
      }
  
      await db.insert(notifications).values({
        profileId: user1.id,
        title: "Selamat Datang!",
        message: "Terima kasih telah bergabung di Start Digital. Mulai jelajahi prompt sekarang.",
        type: "info"
      });
    }

    return Response.json({ ok: true, message: "Seed infrastruktur berhasil." });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
