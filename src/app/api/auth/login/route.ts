import { db } from "@/db";
import { profiles, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return Response.json(
      { ok: false, errors: [{ field: "email", message: "Email wajib diisi." }] },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, normalizedEmail))
    .limit(1);

  if (!profile) {
    return Response.json(
      {
        ok: false,
        errors: [{ field: "email", message: "Email belum terdaftar. Silakan daftar terlebih dahulu." }],
      },
      { status: 404 }
    );
  }

  // Ambil notifikasi user
  const notifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.profileId, profile.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

  // Tentukan benefit berdasarkan plan
  const isPremium = profile.planSlug !== "free" && profile.status === "active";
  const isPending = profile.status === "pending";

  return Response.json({
    ok: true,
    profile: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      planSlug: profile.planSlug,
      status: profile.status,
      role: profile.role,
      createdAt: profile.createdAt,
    },
    notifications: notifs,
    access: {
      isPremium,
      isPending,
      maxPrompts: isPremium ? 9999 : 70,
      canCopyPremium: isPremium,
    },
  });
}
