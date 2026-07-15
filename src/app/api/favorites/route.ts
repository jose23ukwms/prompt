import { db } from "@/db";
import { favorites } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return Response.json({ ids: [] });
  const rows = await db
    .select({ promptId: favorites.promptId })
    .from(favorites)
    .where(eq(favorites.clientId, clientId));
  return Response.json({ ids: rows.map((r) => r.promptId) });
}

export async function POST(req: Request) {
  const { clientId, promptId } = await req.json();
  if (!clientId || !promptId)
    return Response.json({ ok: false }, { status: 400 });
  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.clientId, clientId), eq(favorites.promptId, promptId)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(favorites).values({ clientId, promptId });
  }
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { clientId, promptId } = await req.json();
  if (!clientId || !promptId)
    return Response.json({ ok: false }, { status: 400 });
  await db
    .delete(favorites)
    .where(and(eq(favorites.clientId, clientId), eq(favorites.promptId, promptId)));
  return Response.json({ ok: true });
}
