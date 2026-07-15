import { db } from "@/db";
import { orders, plans, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/payment/order/[id]
// Ambil detail order untuk halaman pembayaran/konfirmasi.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) {
    return Response.json({ ok: false, error: "ID order tidak valid." }, { status: 400 });
  }

  const [row] = await db
    .select({
      id: orders.id,
      amount: orders.amount,
      status: orders.status,
      midtransOrderId: orders.midtransOrderId,
      midtransToken: orders.midtransToken,
      midtransRedirectUrl: orders.midtransRedirectUrl,
      paymentType: orders.paymentType,
      paidAt: orders.paidAt,
      createdAt: orders.createdAt,
      profileName: profiles.name,
      profileEmail: profiles.email,
      profilePhone: profiles.phone,
      planName: plans.name,
      planSlug: plans.slug,
      planPeriod: plans.period,
      planFeatures: plans.features,
    })
    .from(orders)
    .innerJoin(profiles, eq(orders.profileId, profiles.id))
    .innerJoin(plans, eq(orders.planId, plans.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!row) {
    return Response.json({ ok: false, error: "Order tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ ok: true, order: row });
}
