"use client";

import { useEffect, useState } from "react";

type PaymentMode = "midtrans" | "manual_transfer";
type BankAccount = { bank: string; number: string; holderName: string; note?: string };
type PaymentSettings = {
  paymentMode: PaymentMode;
  bankAccounts: BankAccount[];
  transferInstructions: string;
  confirmationNote: string;
};

const EMPTY_BANK: BankAccount = { bank: "", number: "", holderName: "", note: "" };

export default function PaymentSettingsTab() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = (patch: Partial<PaymentSettings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...patch });
  };

  const updateBank = (index: number, patch: Partial<BankAccount>) => {
    if (!settings) return;
    const next = settings.bankAccounts.map((b, i) => (i === index ? { ...b, ...patch } : b));
    setSettings({ ...settings, bankAccounts: next });
  };

  const addBank = () => {
    if (!settings) return;
    setSettings({ ...settings, bankAccounts: [...settings.bankAccounts, { ...EMPTY_BANK }] });
  };

  const removeBank = (index: number) => {
    if (!settings) return;
    setSettings({ ...settings, bankAccounts: settings.bankAccounts.filter((_, i) => i !== index) });
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMessage({ kind: "err", text: data.error || "Gagal menyimpan." });
      } else {
        setMessage({ kind: "ok", text: "Pengaturan pembayaran berhasil disimpan." });
        setSettings(data.settings);
      }
    } catch {
      setMessage({ kind: "err", text: "Terjadi kesalahan jaringan." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-400">Memuat pengaturan...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-bold text-white">Mode Pembayaran Aktif</h2>
        <p className="mt-1 text-sm text-slate-400">
          Pilih metode pembayaran yang ditampilkan ke pelanggan. Dapat diubah kapan saja tanpa deploy ulang.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ModeCard
            active={settings.paymentMode === "manual_transfer"}
            icon="🏦"
            title="Transfer Bank Manual"
            desc="Pelanggan transfer ke rekening Anda, lalu konfirmasi. Anda approve di dashboard."
            onClick={() => update({ paymentMode: "manual_transfer" })}
          />
          <ModeCard
            active={settings.paymentMode === "midtrans"}
            icon="💳"
            title="Midtrans (Otomatis)"
            desc="Pembayaran otomatis via Snap popup. Akun aktif real-time setelah sukses."
            onClick={() => update({ paymentMode: "midtrans" })}
          />
        </div>
      </div>

      {settings.paymentMode === "manual_transfer" && (
        <>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Daftar Rekening Bank</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Rekening yang ditampilkan ke pelanggan di halaman pembayaran.
                </p>
              </div>
              <button
                onClick={addBank}
                className="rounded-xl bg-indigo-500/20 border border-indigo-400/30 px-3 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-500/30"
              >
                + Tambah Rekening
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {settings.bankAccounts.map((b, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Nama Bank" value={b.bank} onChange={(v) => updateBank(i, { bank: v })} placeholder="BCA / Mandiri / BRI / dll" />
                    <Field label="Nomor Rekening" value={b.number} onChange={(v) => updateBank(i, { number: v })} placeholder="1234567890" />
                    <Field label="Atas Nama" value={b.holderName} onChange={(v) => updateBank(i, { holderName: v })} placeholder="PT Start Digital Indonesia" />
                    <Field label="Catatan (opsional)" value={b.note || ""} onChange={(v) => updateBank(i, { note: v })} placeholder="Sertakan kode unik..." />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => removeBank(i)}
                      disabled={settings.bankAccounts.length <= 1}
                      className="text-xs text-rose-300 hover:text-rose-200 disabled:opacity-30"
                    >
                      Hapus rekening
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-bold text-white">Instruksi Transfer</h2>
            <p className="mt-1 text-sm text-slate-400">Teks yang ditampilkan ke pelanggan di halaman pembayaran.</p>
            <textarea
              value={settings.transferInstructions}
              onChange={(e) => update({ transferInstructions: e.target.value })}
              rows={4}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-bold text-white">Catatan Konfirmasi</h2>
            <p className="mt-1 text-sm text-slate-400">Teks yang muncul di atas tombol "Saya Sudah Transfer".</p>
            <textarea
              value={settings.confirmationNote}
              onChange={(e) => update({ confirmationNote: e.target.value })}
              rows={3}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </>
      )}

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.kind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/10 text-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  );
}

function ModeCard({
  active, icon, title, desc, onClick,
}: {
  active: boolean; icon: string; title: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        active
          ? "border-indigo-400/60 bg-indigo-500/10 ring-1 ring-indigo-400/40"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {active && <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">AKTIF</span>}
      </div>
      <h3 className="mt-3 font-bold text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-400">{desc}</p>
    </button>
  );
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
      />
    </label>
  );
}
