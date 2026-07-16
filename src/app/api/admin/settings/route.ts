import { NextResponse } from "next/server";
import { getPaymentSettings, setPaymentSettings, type PaymentSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getPaymentSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const next = body.settings as PaymentSettings;

    if (!next || typeof next !== "object") {
      return NextResponse.json({ ok: false, error: "Payload tidak valid." }, { status: 400 });
    }

    if (next.paymentMode !== "midtrans" && next.paymentMode !== "manual_transfer") {
      return NextResponse.json({ ok: false, error: "Mode pembayaran tidak valid." }, { status: 400 });
    }

    if (!Array.isArray(next.bankAccounts) || next.bankAccounts.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Minimal 1 rekening bank harus diisi untuk mode transfer manual." },
        { status: 400 }
      );
    }

    const cleaned: PaymentSettings = {
      paymentMode: next.paymentMode,
      bankAccounts: next.bankAccounts.map((b) => ({
        bank: String(b.bank || "").trim(),
        number: String(b.number || "").trim(),
        holderName: String(b.holderName || "").trim(),
        logo: b.logo ? String(b.logo).trim() : undefined,
        note: b.note ? String(b.note).trim() : undefined,
      })).filter((b) => b.bank && b.number && b.holderName),
      transferInstructions: String(next.transferInstructions || "").trim(),
      confirmationNote: String(next.confirmationNote || "").trim(),
    };

    if (cleaned.bankAccounts.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Semua rekening bank harus memiliki bank, nomor, dan nama pemilik." },
        { status: 400 }
      );
    }

    await setPaymentSettings(cleaned);
    return NextResponse.json({ ok: true, settings: cleaned });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Gagal menyimpan." },
      { status: 500 }
    );
  }
}
