import { db } from "@/db";
import { profiles, orders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const allProfiles = await db
    .select()
    .from(profiles)
    .orderBy(desc(profiles.createdAt));

  return Response.json({ profiles: allProfiles });
}

export async function POST(req: Request) {
  try {
    const { profileId, action } = await req.json();
    if (!profileId || !action) {
      return Response.json({ ok: false, error: "ID dan aksi wajib diisi." }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, Number(profileId)))
      .limit(1);

    if (!user) {
      return Response.json({ ok: false, error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Proteksi keamanan: email owner tidak boleh dimanipulasi
    if (user.email === "ucidesya@gmail.com") {
      return Response.json({ ok: false, error: "Akun pemilik utama tidak dapat diubah." }, { status: 403 });
    }

    if (action === "delete") {
      await db.delete(profiles).where(eq(profiles.id, user.id));
      return Response.json({ ok: true });
    }

    let newStatus: "active" | "pending" | "rejected" = "active";
    if (action === "approved") newStatus = "active";
    else if (action === "pending") newStatus = "pending";
    else if (action === "reject") newStatus = "rejected";

    await db
      .update(profiles)
      .set({ status: newStatus })
      .where(eq(profiles.id, user.id));

    // Sinkronisasi status order bila ada
    let orderStatus: "approved" | "pending" | "rejected" = "approved";
    if (action === "approved") orderStatus = "approved";
    else if (action === "pending") orderStatus = "pending";
    else if (action === "reject") orderStatus = "rejected";

    await db
      .update(orders)
      .set({ status: orderStatus, updatedAt: new Date() })
      .where(eq(orders.profileId, user.id));

    return Response.json({ ok: true, status: newStatus });
  } catch (err) {
    return Response.json({ ok: false, error: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}
