import { db, pool } from "../db/index";
import { categories, prompts } from "../db/schema";
import {
  auditPrompt,
  buildAutomatedFollowUps,
  buildQualityAppendix,
  type AuditablePrompt,
} from "../lib/prompt-audit";
import { eq } from "drizzle-orm";

async function run() {
  const rows = await db
    .select({
      id: prompts.id,
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

  let repaired = 0;
  let appendixAdded = 0;
  let workflowUpgraded = 0;
  let passedBefore = 0;
  let passedAfter = 0;
  let totalScoreBefore = 0;
  let totalScoreAfter = 0;
  const failures: string[] = [];

  for (const row of rows) {
    const input: AuditablePrompt = {
      ...row,
      tags: row.tags ?? [],
      followUps: row.followUps ?? [],
      supportedAi: row.supportedAi ?? [],
    };

    const before = auditPrompt(input);
    totalScoreBefore += before.score;
    if (before.passed) passedBefore++;

    let content = row.content;
    let followUps = row.followUps ?? [];
    let tags = row.tags ?? [];

    if (!content.includes("PRODUCTION QUALITY GATE")) {
      content += buildQualityAppendix(row.categoryName);
      appendixAdded++;
    }

    const technicalCategory = /coding|automation|ui\/ux/i.test(row.categoryName);
    if (technicalCategory && !/(deploy|deployment|hosting)/i.test(content)) {
      content += "\\n\\n## DEPLOYMENT & HANDOVER GATE\\nJelaskan target hosting, konfigurasi environment variable, langkah deploy, smoke test setelah deploy, monitoring, dan rollback. Jangan menaruh secret di frontend atau repository.";
      appendixAdded++;
    }

    const nextFollowUps = buildAutomatedFollowUps(followUps, row.title, row.categoryName);
    if (JSON.stringify(nextFollowUps) !== JSON.stringify(followUps)) {
      followUps = nextFollowUps;
      workflowUpgraded++;
    }

    const nextTags = [...new Set([...tags, "production-ready", "quality-audited", "workflow-automation"])];
    if (JSON.stringify(nextTags) !== JSON.stringify(tags)) tags = nextTags;

    if (content !== row.content || JSON.stringify(followUps) !== JSON.stringify(row.followUps) || JSON.stringify(tags) !== JSON.stringify(row.tags)) {
      await db
        .update(prompts)
        .set({ content, followUps, tags, updatedAt: new Date() })
        .where(eq(prompts.id, row.id));
      repaired++;
    }

    const after = auditPrompt({ ...input, content, followUps, tags });
    totalScoreAfter += after.score;
    if (after.passed) passedAfter++;
    if (!after.passed) failures.push(`${row.slug}: ${after.errors.concat(after.warnings).join(" | ")}`);
  }

  console.log(JSON.stringify({
    audited: rows.length,
    repaired,
    appendixAdded,
    workflowUpgraded,
    passedBefore,
    passedAfter,
    averageScoreBefore: rows.length ? Math.round(totalScoreBefore / rows.length) : 0,
    averageScoreAfter: rows.length ? Math.round(totalScoreAfter / rows.length) : 0,
    remainingIssues: failures.slice(0, 20),
  }, null, 2));

  await pool.end();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
