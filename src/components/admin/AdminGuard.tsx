"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sd_admin_session");
      setState(raw ? "ok" : "denied");
    } catch {
      setState("denied");
    }
  }, []);

  if (state === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center">
        <div>
          <span className="text-4xl">🔒</span>
          <p className="mt-3 font-semibold text-white">Sesi admin tidak ditemukan.</p>
          <Link href="/admin" className="mt-4 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white">
            Masuk ke Control Panel
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
