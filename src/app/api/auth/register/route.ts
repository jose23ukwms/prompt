import { db } from "@/db";
import { profiles, orders, plans, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LEGAL_VERSION } from "@/lib/access-control";
import { hashPassword, validatePassword } from "@/lib/password";

export const dynamic = "force-dynamic";

// ---------- VALIDATION HELPERS ----------

interface RegisterBody {
  name: string;
  email: string;
  phone: string;
  planSlug: string;
  password: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  // Accept +62, 62, 08xx formats, at least 8 digits
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 255;
}

// Plan benefit matrix — ini adalah sumber kebenaran untuk validasi
const PLAN_BENEFITS: Record<string, { label: string; requiresPayment: boolean; expectedFeatures: string[] }> = {
  free: {
    label: "Gratis 7 Hari",
    requiresPayment: false,
    expectedFeatures: ["70 Prompt pilihan", "Copy 1x per prompt", "Akses 7 hari per perangkat", "Update terbatas"],
  },
  "pro": {
    label: "Pro",
    requiresPayment: true,
    expectedFeatures: [
      "Akses selamanya ke 1000+ prompt premium",
      "Copy tanpa batas",
      "Prompt Troubleshooter",
      "Update selamanya",
      "AI Workflow & Automation",
      "Support prioritas",
    ],
  },
  enterprise: {
    label: "Enterprise",
    requiresPayment: false, // custom pricing, handled separately
    expectedFeatures: ["Lisensi tim & perusahaan", "Prompt kustom on-demand", "SOP & workflow internal", "Onboarding & pelatihan", "Dedicated support"],
  },
};

function validateRegistration(body: RegisterBody): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateName(body.name || "")) {
    errors.push({
      field: "name",
      message: "Nama harus 2-255 karakter.",
    });
  }

  if (!validateEmail(body.email || "")) {
    errors.push({
      field: "email",
      message: "Format email tidak valid.",
    });
  }

  if (!validatePhone(body.phone || "")) {
    errors.push({
      field: "phone",
      message: "Nomor telepon tidak valid (min 8 digit).",
    });
  }

  if (!body.planSlug || !PLAN_BENEFITS[body.planSlug]) {
    errors.push({
      field: "plan",
      message: "Pilih paket yang tersedia.",
    });
  }

  if (body.acceptedTerms !== true || body.acceptedPrivacy !== true) {
    errors.push({
      field: "legal",
      message: "Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.",
    });
  }

  const pw = typeof body.password === "string" ? body.password : "";
  const pwCheck = validatePassword(pw);
  if (!pwCheck.valid) {
    errors.push({ field: "password", message: pwCheck.errors[0] ?? "Password tidak valid." });
  }

  return errors;
}

// ---------- POST: REGISTER ----------

export async function POST(req: Request) {
  const body: RegisterBody = await req.json();
  const errors = validateRegistration(body);

  if (errors.length > 0) {
    return Response.json({ ok: false, errors }, { status: 400 });
  }

  // 1) Cek duplikat email
  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, body.email.trim().toLowerCase()))
    .limit(1);

  if (existing) {
    return Response.json(
      {
        ok: false,
        errors: [{ field: "email", message: "Email sudah terdaftar. Silakan masuk." }],
      },
      { status: 409 }
    );
  }

  // 2) Validasi plan exists in DB dan benefit sesuai
  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.slug, body.planSlug))
    .limit(1);

  if (!plan) {
    return Response.json(
      {
        ok: false,
        errors: [{ field: "plan", message: "Paket tidak ditemukan di database." }],
      },
      { status: 400 }
    );
  }

  // Validasi benefit yang terlalu ketat dihapus — benefit dapat diubah dari dashboard
  // tanpa perlu sinkronisasi kode. Cukup validasi harga paket.
  const expected = PLAN_BENEFITS[body.planSlug];

  // 4) VALIDASI HARGA: pastikan harga di DB sesuai
  if (expected.requiresPayment && plan.price <= 0) {
    return Response.json(
      {
        ok: false,
        errors: [
          {
            field: "plan",
            message: `Harga paket "${plan.name}" tidak valid (Rp${plan.price}). Harap hubungi admin.`,
          },
        ],
      },
      { status: 400 }
    );
  }

  // 5) Tentukan status akun berdasarkan plan
  //    - Free/Enterprise: langsung active
  //    - Pro: pending sampai admin approve pembayaran
  const initialStatus = expected.requiresPayment ? "pending" : "active";

  // 6) Hash password lalu buat profile
  const passwordHash = await hashPassword(body.password);
  const [newProfile] = await db
    .insert(profiles)
    .values({
      email: body.email.trim().toLowerCase(),
      name: body.name.trim(),
      phone: (body.phone || "").trim(),
      passwordHash,
      planSlug: body.planSlug,
      status: initialStatus,
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
      legalVersion: LEGAL_VERSION,
    })
    .returning();

  // 7) Buat order untuk plan berbayar
  let orderId: number | null = null;
  if (expected.requiresPayment) {
    const [newOrder] = await db.insert(orders).values({
      profileId: newProfile.id,
      planId: plan.id,
      amount: plan.price,
      status: "pending",
    }).returning();
    orderId = newOrder.id;

    // Notifikasi: menunggu pembayaran
    await db.insert(notifications).values({
      profileId: newProfile.id,
      title: "Menunggu Pembayaran 💳",
      message: `Pendaftaran paket ${plan.name} berhasil! Silakan lakukan pembayaran Rp${plan.price.toLocaleString("id-ID")}/${plan.period} melalui Midtrans.`,
      type: "info",
    });
  } else {
    // Free / Enterprise: notifikasi selamat datang
    await db.insert(notifications).values({
      profileId: newProfile.id,
      title: "Selamat Datang! 🎉",
      message: `Akun Anda aktif di paket ${plan.name}. ${body.planSlug === "free" ? "Upgrade kapan saja untuk akses penuh." : "Tim kami akan menghubungi Anda segera."}`,
      type: "success",
    });
  }

  return Response.json({
    ok: true,
    profile: {
      id: newProfile.id,
      name: newProfile.name,
      email: newProfile.email,
      planSlug: newProfile.planSlug,
      status: newProfile.status,
    },
    plan: {
      name: plan.name,
      price: plan.price,
      period: plan.period,
      features: plan.features,
    },
    requiresPayment: expected.requiresPayment,
    orderId,
  });
}
