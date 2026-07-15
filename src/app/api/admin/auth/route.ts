import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Passphrase admin — bisa dioverride via env ADMIN_PASSPHRASE.
const ADMIN_PASSPHRASE = process.env.ADMIN_PASSPHRASE || "startdigital2026";

export async function POST(req: Request) {
  const { email, passphrase } = await req.json();

  // Cara 1: masuk via passphrase master (owner)
  if (passphrase && passphrase === ADMIN_PASSPHRASE) {
    return Response.json({
      ok: true,
      admin: { name: "Master Admin", email: "help@startdigital.app", role: "superadmin" },
    });
  }

  // Cara 2: masuk via email profile dengan role admin/superadmin
  if (email) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, String(email).trim().toLowerCase()))
      .limit(1);

    if (profile && (profile.role === "admin" || profile.role === "superadmin")) {
      return Response.json({
        ok: true,
        admin: { name: profile.name, email: profile.email, role: profile.role },
      });
    }
  }

  return Response.json(
    { ok: false, error: "Kredensial admin tidak valid." },
    { status: 401 }
  );
}
