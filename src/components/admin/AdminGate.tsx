"use client";

import { useEffect, useState, type ReactNode } from "react";

export type AdminSession = { name: string; email: string; role: string };

const KEY = "sd_admin_session";

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setChecked(true);
  }, []);

  const login = (s: AdminSession) => {
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setSession(null);
  };

  return { session, checked, login, logout };
}

export default function AdminGate({
  session,
  checked,
  onLogin,
  children,
}: {
  session: AdminSession | null;
  checked: boolean;
  onLogin: (s: AdminSession) => void;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<"pass" | "email">("pass");
  const [passphrase, setPassphrase] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "pass" ? { passphrase } : { email }
        ),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Gagal masuk.");
        return;
      }
      onLogin(data.admin);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  if (!checked) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
      </div>
    );
  }

  if (session) return <>{children}</>;

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-4">
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute bottom-0 right-10 h-[320px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      <form
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xl">
            🛡️
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Control Panel
            </h1>
            <p className="text-xs text-slate-400">Akses terbatas — internal.</p>
          </div>
        </div>

        <div className="mt-6 flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("pass")}
            className={`flex-1 rounded-lg py-2 font-semibold transition ${
              mode === "pass" ? "bg-white/10 text-white" : "text-slate-400"
            }`}
          >
            Passphrase
          </button>
          <button
            type="button"
            onClick={() => setMode("email")}
            className={`flex-1 rounded-lg py-2 font-semibold transition ${
              mode === "email" ? "bg-white/10 text-white" : "text-slate-400"
            }`}
          >
            Email Admin
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-4">
          {mode === "pass" ? (
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Masukkan passphrase"
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
          ) : (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@admin.id"
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
          )}
        </div>

        <button
          disabled={loading}
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 disabled:opacity-50"
        >
          {loading ? "Memverifikasi..." : "Masuk"}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Sesi tersimpan lokal di perangkat ini.
        </p>
      </form>
    </div>
  );
}
