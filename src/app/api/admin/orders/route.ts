import { db } from "@/db";
import { profiles, orders, plans, notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const allOrders = await db
    .select({
      id: orders.id,
      amount: orders.amount,
      status: orders.status,
      createdAt: orders.createdAt,
      profileName: profiles.name,
      profileEmail: profiles.email,
      planName: plans.name,
    })
    .from(orders)
    .innerJoin(profiles, eq(orders.profileId, profiles.id))
    .innerJoin(plans, eq(orders.planId, plans.id))
    .orderBy(desc(orders.createdAt));

  return Response.json({ orders: allOrders });
}

export async function POST(req: Request) {
  const { orderId, action } = await req.json(); // action: approve, reject

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return Response.json({ ok: false, error: "Order not found" }, { status: 404 });

  if (action === "approve") {
    const planId = order.planId;
    const profileId = order.profileId;
    if (!planId || !profileId) return Response.json({ ok: false }, { status: 400 });

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    
    // Update Profile Plan
    await db
      .update(profiles)
      .set({ planSlug: plan.slug, status: "active" })
      .where(eq(profiles.id, profileId));

    // Update Order Status
    await db.update(orders).set({ status: "approved", updatedAt: new Date() }).where(eq(orders.id, orderId));

    // Send Notification
    await db.insert(notifications).values({
      profileId: profileId,
      title: "Pembayaran Disetujui! 🎉",
      message: `Selamat! Akun Anda kini aktif di paket ${plan.name}. Nikmati akses penuh ke ribuan prompt premium.`,
      type: "success",
    });

  } else if (action === "reject") {
    const profileId = order.profileId;
    await db.update(orders).set({ status: "rejected", updatedAt: new Date() }).where(eq(orders.id, orderId));

    if (profileId) {
      await db.insert(notifications).values({
        profileId: profileId,
        title: "Pembayaran Ditolak",
        message: "Mohon maaf, bukti pembayaran Anda tidak valid. Silakan coba lagi atau hubungi dukungan.",
        type: "warning",
      });
    }
  }

  return Response.json({ ok: true });
}
