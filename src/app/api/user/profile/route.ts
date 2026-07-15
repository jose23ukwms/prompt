import { db } from "@/db";
import { profiles, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return Response.json({ profile: null, notifications: [] });

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);

  if (!profile) return Response.json({ profile: null, notifications: [] });

  const notifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.profileId, profile.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

  return Response.json({ profile, notifications: notifs });
}
