import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) {
    return Response.json({ isPremium: false, planSlug: "free", status: "anonymous" });
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email.trim().toLowerCase()))
    .limit(1);

  if (!profile) {
    return Response.json({ isPremium: false, planSlug: "free", status: "anonymous" });
  }

  const isPremium = profile.planSlug !== "free" && profile.status === "active";

  return Response.json({
    isPremium,
    planSlug: profile.planSlug,
    status: profile.status,
    name: profile.name,
    email: profile.email,
  });
}
