import { db } from "@/db";
import { orders, profiles, plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSnap, buildMidtransOrderId, isMidtransConfigured } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

// POST /api/payment/create
// Body: { orderId }
// Membuat Snap transaction Midtrans untuk order yang belum dibayar.
export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return Response.json({ ok: false, error: "orderId wajib." }, { status: 400 });
    }

    if (!isMidtransConfigured) {
      return Response.json(
        {
          ok: false,
          error: "Midtrans belum dikonfigurasi. Hubungi admin untuk mengaktifkan pembayaran online.",
          configMissing: true,
        },
        { status: 503 }
      );
    }

    // Ambil order + profile + plan
    const [row] = await db
      .select({
        orderId: orders.id,
        amount: orders.amount,
        status: orders.status,
        existingToken: orders.midtransToken,
        existingRedirect: orders.midtransRedirectUrl,
        profileId: profiles.id,
        email: profiles.email,
        name: profiles.name,
        phone: profiles.phone,
        planId: plans.id,
        planName: plans.name,
        planSlug: plans.slug,
      })
      .from(orders)
      .innerJoin(profiles, eq(orders.profileId, profiles.id))
      .innerJoin(plans, eq(orders.planId, plans.id))
      .where(eq(orders.id, Number(orderId)))
      .limit(1);

    if (!row) {
      return Response.json({ ok: false, error: "Order tidak ditemukan." }, { status: 404 });
    }

    if (row.status === "approved") {
      return Response.json(
        { ok: false, error: "Order sudah dibayar dan disetujui." },
        { status: 400 }
      );
    }

    // Jika masih ada token aktif, gunakan ulang (Midtrans menoleransi ini selama window)
    if (row.existingToken && row.existingRedirect && row.status === "pending") {
      return Response.json({
        ok: true,
        token: row.existingToken,
        redirectUrl: row.existingRedirect,
        reused: true,
      });
    }

    const midtransOrderId = buildMidtransOrderId(row.orderId);

    const snap = getSnap();
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: row.amount,
      },
      customer_details: {
        first_name: row.name,
        email: row.email,
        phone: row.phone || "",
      },
      item_details: [
        {
          id: `plan-${row.planId}`,
          name: `Paket ${row.planName}`,
          price: row.amount,
          quantity: 1,
          category: "Membership",
        },
      ],
      credit_card: { secure: true },
    });

    await db
      .update(orders)
      .set({
        midtransOrderId,
        midtransToken: transaction.token,
        midtransRedirectUrl: transaction.redirect_url,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, row.orderId));

    return Response.json({
      ok: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat transaksi.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
