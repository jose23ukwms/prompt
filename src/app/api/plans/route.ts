import { db } from "@/db";
import { plans } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(plans).orderBy(plans.sortOrder);
  return Response.json({ plans: rows });
}
