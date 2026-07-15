"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Plan = {
  id: number;
  slug: string;
  name: string;
  price: number;
  period: string;
  highlighted: boolean;
  features: string[];
};

type FieldError = { field: string; message: string };

function DaftarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    profile: Record<string, unknown>;
    plan: Plan & { price: number; period: string };
    requiresPayment: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => {
        const planList = d.plans || [];
        setPlans(planList);
        // Pre-select plan from URL param
        const planParam = searchParams.get("plan");
        if (planParam && planList.some((p: Plan) => p.slug === planParam)) {
          setSelectedPlan(planParam);
        }
      });
  }, [searchParams]);

  const selected = plans.find((p) => p.slug === selectedPlan);

  const getFieldError = (field: string) =>
    errors.find((e) => e.field === field)?.message;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          planSlug: selectedPlan,
          acceptedTerms: acceptedLegal,
          acceptedPrivacy: acceptedLegal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || []);
        return;
      }

      // Simpan email ke localStorage untuk session
      localStorage.setItem("sd_user_email", email.trim().toLowerCase());

      // Jika perlu pembayaran, redirect langsung ke halaman pembayaran
      if (data.requiresPayment && data.orderId) {
        router.push(`/pembayaran/${data.orderId}`);
        return;
      }

      setSuccess(data);
    } catch {
      setErrors([{ field: "form", message: "Terjadi kesalahan jaringan." }]);
    } finally {
      setLoading(false);
    }
  }

  // Sukses
  if (success) {
    const { profile, plan, requiresPayment } = success;
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-emerald-500/10 to-slate-900/50 p-8 text-center">
          <span className="text-5xl">🎉</span>
          <h1 className="mt-4 text-2xl font-black text-white">
            Pendaftaran Berhasil!
          </h1>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
            <div className="grid gap-3 text-sm">
              <Row label="Nama" value={String(profile.name)} />
              <Row label="Email" value={String(profile.email)} />
              <Row label="Paket" value={plan.name} />
              <Row label="Status" value={String(profile.status)} />
            </div>

            {requiresPayment && (
              <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-400/30 p-4">
                <p className="text-sm font-bold text-amber-200">
                  💳 Pembayaran Diperlukan
                </p>
                <p className="mt-1 text-sm text-amber-100/80">
                  Silakan transfer <b>Rp{plan.price.toLocaleString("id-ID")}</b>/{plan.period}
                  {" "}ke rekening yang tersedia. Admin akan memverifikasi pembayaran Anda.
                </p>
                <div className="mt-3 rounded-lg bg-slate-950/50 p-3 text-xs text-slate-300">
                  <p>BCA: 123-456-7890 a.n. Start Digital</p>
                  <p>Mandiri: 098-765-4321 a.n. Start Digital</p>
                  <p>QRIS: Tersedia di halaman pembayaran</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
            <h3 className="text-sm font-bold text-white">
              ✅ Benefit yang Anda terima:
            </h3>
            <ul className="mt-3 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-0.5 text-emerald-400">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white"
            >
              Buka Dashboard
            </Link>
            <Link
              href="/prompts"
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white"
            >
              Jelajahi Prompt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black sm:text-4xl">Buat Akun</h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-300">
          Daftar untuk mengakses prompt premium sesuai paket yang Anda pilih.
          Benefit akan langsung aktif setelah pembayaran dikonfirmasi.
        </p>
      </div>

      {/* STEP 1: PILIH PAKET */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-500 text-xs font-bold">
            1
          </span>
          Pilih Paket
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {plans.map((p) => {
            const active = selectedPlan === p.slug;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.slug)}
                className={`relative rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-indigo-400 bg-indigo-500/10 ring-1 ring-indigo-400/50"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                {p.highlighted && (
                  <span className="absolute -top-2 right-4 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2 py-0.5 text-[9px] font-bold uppercase">
                    Populer
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{p.name}</h3>
                  {active && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-500 text-xs text-white">
                      ✓
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-black text-white">
                    {p.price === 0 && p.period === "custom"
                      ? "Custom"
                      : p.price === 0
                      ? "Rp0"
                      : `Rp${p.price.toLocaleString("id-ID")}`}
                  </span>
                  {p.price > 0 && (
                    <span className="text-sm text-slate-400">/{p.period}</span>
                  )}
                </div>
                <ul className="mt-3 space-y-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <span className="mt-0.5 text-emerald-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        {getFieldError("plan") && (
          <p className="mt-2 text-xs text-rose-400">{getFieldError("plan")}</p>
        )}
      </div>

      {/* STEP 2: ISI DATA DIRI */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-500 text-xs font-bold">
            2
          </span>
          Data Diri
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Global error */}
          {getFieldError("form") && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {getFieldError("form")}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Nama Lengkap *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className={inputCls(getFieldError("name"))}
            />
            {getFieldError("name") && (
              <p className="mt-1 text-xs text-rose-400">{getFieldError("name")}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              className={inputCls(getFieldError("email"))}
            />
            {getFieldError("email") && (
              <p className="mt-1 text-xs text-rose-400">{getFieldError("email")}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Nomor Telepon / WhatsApp *
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              className={inputCls(getFieldError("phone"))}
            />
            {getFieldError("phone") && (
              <p className="mt-1 text-xs text-rose-400">{getFieldError("phone")}</p>
            )}
          </div>

          {/* STEP 3: KONFIRMASI BENEFIT */}
          {selected && (
            <div className="mt-6 rounded-2xl border border-indigo-400/30 bg-indigo-500/[0.06] p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-500 text-xs font-bold">
                  3
                </span>
                Konfirmasi Benefit — {selected.name}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Pastikan benefit berikut sesuai dengan paket yang Anda pilih:
              </p>
              <ul className="mt-3 space-y-2">
                {selected.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                    <span className="mt-0.5 text-emerald-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              {selected.price > 0 && (
                <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-400/20 p-3 text-xs text-amber-200">
                  💳 Setelah mendaftar, Anda perlu melakukan pembayaran{" "}
                  <b>Rp{selected.price.toLocaleString("id-ID")}/{selected.period}</b>.
                  {" "}Akun akan aktif setelah admin menyetujui pembayaran.
                </div>
              )}
            </div>
          )}

          <div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-slate-300">
              <input
                type="checkbox"
                checked={acceptedLegal}
                onChange={(e) => setAcceptedLegal(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-500"
              />
              <span>
                Saya telah membaca dan menyetujui{" "}
                <Link href="/syarat-ketentuan" target="_blank" className="font-semibold text-indigo-300 hover:underline">Syarat & Ketentuan</Link>{" "}
                serta{" "}
                <Link href="/kebijakan-privasi" target="_blank" className="font-semibold text-indigo-300 hover:underline">Kebijakan Privasi</Link>, termasuk tracking perangkat untuk akses gratis 7 hari dan batas copy paket gratis.
              </span>
            </label>
            {getFieldError("legal") && <p className="mt-1 text-xs text-rose-400">{getFieldError("legal")}</p>}
          </div>

          <button
            disabled={loading || !selectedPlan || !acceptedLegal}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition disabled:opacity-40"
          >
            {loading
              ? "Memproses..."
              : selected
              ? `Daftar Paket ${selected.name}`
              : "Pilih paket terlebih dahulu"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-indigo-300 hover:text-indigo-200">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-xl border ${
    error ? "border-rose-400" : "border-white/10"
  } bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none`;
}

// Wrap with Suspense for useSearchParams
export default function DaftarPageWrapper() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400">Memuat...</div>}>
      <DaftarPage />
    </Suspense>
  );
}
