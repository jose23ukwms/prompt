import { db } from "@/db";
import { plans } from "@/db/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAYMENTS = ["QRIS", "Transfer Bank", "Virtual Account", "E-Wallet", "Midtrans", "Xendit"];

function formatPrice(price: number, period: string) {
  if (price === 0 && period === "custom") return "Hubungi Kami";
  if (price === 0) return "Rp0";
  return "Rp" + price.toLocaleString("id-ID");
}

export default async function HargaPage() {
  const rows = await db.select().from(plans).orderBy(plans.sortOrder);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-black">Harga & Membership</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Mulai gratis, upgrade kapan saja. Setiap paket memberikan benefit yang sesuai dengan harga.
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {rows.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-3xl border p-6 ${
              plan.highlighted
                ? "border-indigo-400/60 bg-gradient-to-b from-indigo-600/20 to-slate-900"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                Paling Populer
              </span>
            )}
            <h2 className="text-lg font-bold text-white">{plan.name}</h2>
            <div className="mt-3">
              <span className="text-3xl font-black text-white">
                {formatPrice(plan.price, plan.period)}
              </span>
              {plan.price > 0 && (
                <span className="text-sm text-slate-400">/{plan.period}</span>
              )}
            </div>

            {/* Benefit list — ini yang user terima sesuai harga */}
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {(plan.features as string[]).map((f) => (
                <li key={f} className="flex items-start gap-2 text-slate-300">
                  <span className="mt-0.5 text-emerald-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA button — arahkan ke form daftar */}
            <Link
              href={
                plan.price === 0 && plan.period === "custom"
                  ? "/daftar"
                  : plan.price === 0
                  ? "/prompts"
                  : `/daftar?plan=${plan.slug}`
              }
              className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
                plan.highlighted
                  ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90"
                  : "border border-white/15 text-white hover:bg-white/10"
              }`}
            >
              {plan.price === 0 && plan.period === "custom"
                ? "Hubungi Sales"
                : plan.price === 0
                ? "Mulai Gratis"
                : "Daftar Sekarang"}
            </Link>
          </div>
        ))}
      </div>

      {/* Perbandingan benefit */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center">Perbandingan Benefit</h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Pastikan benefit yang Anda terima sesuai dengan harga yang dibayarkan.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Benefit</th>
                {rows.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-center">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Akses prompt", values: ["70 prompt / 7 hari", "1330+ prompt", "Semua + prompt kustom"] },
                { label: "Prompt premium", values: ["✗", "✓", "✓"] },
                { label: "Copy tanpa batas", values: ["✗ (1x/prompt)", "✓", "✓"] },
                { label: "Prompt Troubleshooter", values: ["✗", "✓", "✓"] },
                { label: "Prompt lanjutan (follow-up)", values: ["Terbatas", "✓", "✓"] },
                { label: "AI Workflow & Automation", values: ["✗", "✓", "✓"] },
                { label: "Update selamanya", values: ["✗", "✓", "✓"] },
                { label: "Support prioritas", values: ["✗", "✓", "✓"] },
                { label: "Lisensi tim & perusahaan", values: ["✗", "✗", "✓"] },
                { label: "API integration", values: ["✗", "✗", "✓"] },
                { label: "Onboarding & training", values: ["✗", "", "✓"] },
                { label: "SLA & dedicated support", values: ["✗", "✗", "✓"] },
              ].map((row) => (
                <tr key={row.label} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-300">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      <span className={
                        v === "✓" ? "text-emerald-400" :
                        v === "✗" ? "text-slate-600" :
                        v.includes("Terbatas") ? "text-amber-400" :
                        "text-white"
                      }>
                        {v}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-14 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <h3 className="text-lg font-bold text-white">Metode Pembayaran</h3>
        <p className="mt-1 text-sm text-slate-400">
          Pembayaran aman dan instan melalui berbagai channel.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {PAYMENTS.map((p) => (
            <span
              key={p}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
