import { db } from "@/db";
import { profiles, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json(
      { ok: false, errors: [{ field: "form", message: "Email dan password wajib diisi." }] },
      { status: 400 }
    );
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);

  // Pesan generik untuk mencegah user enumeration
  if (!profile) {
    return Response.json(
      { ok: false, errors: [{ field: "form", message: "Email atau password salah." }] },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(password, profile.passwordHash);
  if (!ok) {
    return Response.json(
      { ok: false, errors: [{ field: "form", message: "Email atau password salah." }] },
      { status: 401 }
    );
  }

  if (profile.status === "rejected") {
    return Response.json(
      { ok: false, errors: [{ field: "form", message: "Akun Anda telah ditolak. Hubungi bantuan." }] },
      { status: 403 }
    );
  }

  const notifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.profileId, profile.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

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
