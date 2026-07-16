"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.errors?.[0]?.message || "Gagal masuk.");
        return;
      }

      localStorage.setItem("sd_user_email", email.trim().toLowerCase());
      localStorage.setItem("sd_user_plan", data.profile.planSlug);
      localStorage.setItem("sd_user_status", data.profile.status);
      localStorage.setItem("sd_user_name", data.profile.name);

      if (data.access.isPending) {
        router.push("/dashboard?tab=membership");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <div className="text-center">
          <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl">
            🔐
          </span>
          <h1 className="mt-4 text-2xl font-black">Masuk ke Akun</h1>
          <p className="mt-1 text-sm text-slate-400">
            Masukkan email dan password yang Anda buat saat mendaftar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Masukkan password Anda"
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50"
          >
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link href="/daftar" className="text-indigo-300 hover:text-indigo-200">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
