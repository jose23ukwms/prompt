import { MIDTRANS_CLIENT_KEY, MIDTRANS_SNAP_URL, MIDTRANS_IS_PRODUCTION, isMidtransConfigured } from "@/lib/midtrans";
import { getPaymentSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// GET /api/payment/config
// Mengirim mode pembayaran aktif + konfigurasi yang diperlukan oleh frontend.
// Server key Midtrans TIDAK pernah dikirim.
export async function GET() {
  const settings = await getPaymentSettings();
  return Response.json({
    configured: isMidtransConfigured,
    clientKey: MIDTRANS_CLIENT_KEY,
    snapUrl: MIDTRANS_SNAP_URL,
    isProduction: MIDTRANS_IS_PRODUCTION,
    paymentMode: settings.paymentMode,
    bankAccounts: settings.bankAccounts,
    transferInstructions: settings.transferInstructions,
    confirmationNote: settings.confirmationNote,
  });
}
