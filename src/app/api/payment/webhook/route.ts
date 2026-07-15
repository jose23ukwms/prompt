import { db } from "@/db";
import { orders, plans, profiles, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// POST /api/payment/webhook
// Endpoint yang dipanggil Midtrans untuk update status transaksi.
// Docs: https://docs.midtrans.com/reference/notification-webhooks
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const midtransOrderId: string | undefined = body.order_id;
    const statusCode: string | undefined = body.status_code;
    const grossAmount: string | undefined = body.gross_amount;
    const signatureKey: string | undefined = body.signature_key;
    const transactionStatus: string | undefined = body.transaction_status;
    const fraudStatus: string | undefined = body.fraud_status;
    const paymentType: string | undefined = body.payment_type;

    if (!midtransOrderId || !statusCode || !grossAmount || !signatureKey) {
      return Response.json({ ok: false, error: "Payload tidak lengkap." }, { status: 400 });
    }

    // Verifikasi signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (!serverKey) {
      return Response.json({ ok: false, error: "Server belum dikonfigurasi." }, { status: 503 });
    }

    const expectedSig = crypto
      .createHash("sha512")
      .update(midtransOrderId + statusCode + grossAmount + serverKey)
      .digest("hex");

    if (expectedSig !== signatureKey) {
      return Response.json({ ok: false, error: "Signature tidak valid." }, { status: 401 });
    }

    // Cari order berdasarkan midtransOrderId
    const [row] = await db
      .select({
        id: orders.id,
        profileId: orders.profileId,
        planId: orders.planId,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.midtransOrderId, midtransOrderId))
      .limit(1);

    if (!row) {
      return Response.json({ ok: false, error: "Order tidak ditemukan." }, { status: 404 });
    }

    // Mapping status Midtrans ke status internal
    let newStatus: "pending" | "approved" | "rejected" | "cancelled" | "expired" = "pending";
    let notifTitle = "";
    let notifMessage = "";
    let notifType: "info" | "success" | "warning" = "info";

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "deny") {
        newStatus = "rejected";
        notifTitle = "Pembayaran Ditolak (Fraud)";
        notifMessage = "Pembayaran Anda ditolak oleh sistem karena terindikasi fraud. Silakan coba metode lain.";
        notifType = "warning";
      } else {
        newStatus = "approved";
        notifTitle = "Pembayaran Berhasil! 🎉";
        notifMessage = "Terima kasih! Pembayaran Anda telah diterima. Akun premium Anda kini aktif.";
        notifType = "success";
      }
    } else if (transactionStatus === "pending") {
      newStatus = "pending";
      notifTitle = "Menunggu Pembayaran ⏳";
      notifMessage = "Pesanan Anda menunggu pembayaran. Silakan selesaikan pembayaran sesuai instruksi.";
      notifType = "info";
    } else if (transactionStatus === "deny") {
      newStatus = "rejected";
      notifTitle = "Pembayaran Ditolak";
      notifMessage = "Pembayaran Anda ditolak. Silakan coba metode pembayaran lain.";
      notifType = "warning";
    } else if (transactionStatus === "cancel") {
      newStatus = "cancelled";
      notifTitle = "Pembayaran Dibatalkan";
      notifMessage = "Pembayaran Anda telah dibatalkan.";
      notifType = "warning";
    } else if (transactionStatus === "expire") {
      newStatus = "expired";
      notifTitle = "Pembayaran Kedaluwarsa";
      notifMessage = "Waktu pembayaran Anda sudah habis. Silakan buat pesanan baru.";
      notifType = "warning";
    }

    // Update order
    await db
      .update(orders)
      .set({
        status: newStatus,
        paymentType: paymentType || null,
        paymentMethod: paymentType || null,
        paidAt: newStatus === "approved" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, row.id));

    // Jika approved: aktifkan plan user
    if (newStatus === "approved" && row.profileId && row.planId) {
      const [plan] = await db.select().from(plans).where(eq(plans.id, row.planId)).limit(1);
      if (plan) {
        await db
          .update(profiles)
          .set({ planSlug: plan.slug, status: "active" })
          .where(eq(profiles.id, row.profileId));
      }
    }

    // Kirim notifikasi ke user
    if (row.profileId && notifTitle) {
      await db.insert(notifications).values({
        profileId: row.profileId,
        title: notifTitle,
        message: notifMessage,
        type: notifType === "success" ? "success" : notifType === "warning" ? "warning" : "info",
      });
    }

    return Response.json({ ok: true, status: newStatus });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
