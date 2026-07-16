import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type PaymentMode = "midtrans" | "manual_transfer";

export type BankAccount = {
  bank: string;
  number: string;
  holderName: string;
  logo?: string;
  note?: string;
};

export type PaymentSettings = {
  paymentMode: PaymentMode;
  bankAccounts: BankAccount[];
  transferInstructions: string;
  confirmationNote: string;
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  paymentMode: "manual_transfer",
  bankAccounts: [
    {
      bank: "BCA",
      number: "1234567890",
      holderName: "PT Start Digital Indonesia",
      note: "Transfer sesuai nominal. Sertakan kode unik 3 digit terakhir jika ada.",
    },
    {
      bank: "Mandiri",
      number: "0987654321",
      holderName: "PT Start Digital Indonesia",
      note: "",
    },
    {
      bank: "BRI",
      number: "1122334455",
      holderName: "PT Start Digital Indonesia",
      note: "",
    },
  ],
  transferInstructions:
    "Lakukan transfer sesuai nominal yang tertera. Setelah transfer, klik tombol \"Saya Sudah Transfer\" dan tim kami akan memverifikasi dalam 1x24 jam. Akun premium akan aktif otomatis setelah disetujui.",
  confirmationNote:
    "Dengan mengklik tombol konfirmasi, Anda menyatakan telah melakukan transfer sesuai nominal. Bukti transfer dapat dikirim ke help@startdigital.app jika diperlukan.",
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "payment"))
    .limit(1);

  if (!row) return DEFAULT_PAYMENT_SETTINGS;

  const value = row.value as Partial<PaymentSettings>;
  return {
    paymentMode: value.paymentMode ?? DEFAULT_PAYMENT_SETTINGS.paymentMode,
    bankAccounts:
      Array.isArray(value.bankAccounts) && value.bankAccounts.length > 0
        ? (value.bankAccounts as BankAccount[])
        : DEFAULT_PAYMENT_SETTINGS.bankAccounts,
    transferInstructions:
      value.transferInstructions || DEFAULT_PAYMENT_SETTINGS.transferInstructions,
    confirmationNote:
      value.confirmationNote || DEFAULT_PAYMENT_SETTINGS.confirmationNote,
  };
}

export async function setPaymentSettings(next: PaymentSettings): Promise<void> {
  await db
    .insert(settings)
    .values({
      key: "payment",
      value: next,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: next, updatedAt: new Date() },
    });
}
