// Midtrans Snap client wrapper.
// Semua transaksi dibuat server-side, redirect URL dikirim ke halaman payment.
import midtransClient, { Snap, CoreApi } from "midtrans-client";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

export const MIDTRANS_CLIENT_KEY = clientKey;
export const MIDTRANS_IS_PRODUCTION = isProduction;

// Snap URL untuk dipakai di client (script src)
export const MIDTRANS_SNAP_URL = isProduction
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

export const isMidtransConfigured = Boolean(serverKey && clientKey);

let snapClient: Snap | null = null;

export function getSnap() {
  if (!isMidtransConfigured) {
    throw new Error(
      "Midtrans belum dikonfigurasi. Set MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY di environment."
    );
  }
  if (!snapClient) {
    snapClient = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    });
  }
  return snapClient;
}

let coreClient: CoreApi | null = null;

export function getCore() {
  if (!isMidtransConfigured) {
    throw new Error("Midtrans belum dikonfigurasi.");
  }
  if (!coreClient) {
    coreClient = new midtransClient.CoreApi({
      isProduction,
      serverKey,
      clientKey,
    });
  }
  return coreClient;
}

// Format order id unik yang dikirim ke Midtrans (max 50 char)
export function buildMidtransOrderId(orderId: number) {
  return `SD-${orderId}-${Date.now().toString(36)}`;
}
