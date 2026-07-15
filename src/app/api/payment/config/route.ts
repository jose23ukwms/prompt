import { MIDTRANS_CLIENT_KEY, MIDTRANS_SNAP_URL, MIDTRANS_IS_PRODUCTION, isMidtransConfigured } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

// GET /api/payment/config
// Hanya mengirim clientKey (publik) dan URL Snap. Server key TIDAK pernah dikirim.
export async function GET() {
  return Response.json({
    configured: isMidtransConfigured,
    clientKey: MIDTRANS_CLIENT_KEY,
    snapUrl: MIDTRANS_SNAP_URL,
    isProduction: MIDTRANS_IS_PRODUCTION,
  });
}
