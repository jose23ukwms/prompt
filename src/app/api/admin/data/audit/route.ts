import { db } from "@/db";
import { categories, prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auditPrompt, type AuditablePrompt } from "@/lib/prompt-audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      slug: prompts.slug,
      title: prompts.title,
      description: prompts.description,
      content: prompts.content,
      usage: prompts.usage,
      exampleOutput: prompts.exampleOutput,
      tags: prompts.tags,
      followUps: prompts.followUps,
      supportedAi: prompts.supportedAi,
      isPremium: prompts.isPremium,
      categoryName: categories.name,
    })
    .from(prompts)
    .innerJoin(categories, eq(prompts.categoryId, categories.id));

  const audits = rows.map((row) =>
    auditPrompt({
      ...row,
      tags: row.tags ?? [],
      followUps: row.followUps ?? [],
      supportedAi: row.supportedAi ?? [],
    } as AuditablePrompt)
  );
  const passed = audits.filter((a) => a.passed).length;
  const scores = audits.map((a) => a.score);
  const warnings = audits.reduce((sum, a) => sum + a.warnings.length, 0);
  const errors = audits.reduce((sum, a) => sum + a.errors.length, 0);

  return Response.json({
    ok: true,
    summary: {
      total: audits.length,
      passed,
      failed: audits.length - passed,
      passRate: audits.length ? Math.round((passed / audits.length) * 100) : 0,
      averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      warnings,
      errors,
    },
    failures: audits.filter((a) => !a.passed).slice(0, 50),
  });
}
