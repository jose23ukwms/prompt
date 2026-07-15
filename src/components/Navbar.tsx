"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/prompts", label: "Jelajahi" },
  { href: "/kategori", label: "Kategori" },
  { href: "/asisten", label: "AI Asisten" },
  { href: "/harga", label: "Harga" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sd_admin_session");
      if (raw) setIsAdminAuth(true);
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-black">
            S
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">Start Digital</p>
            <p className="text-[10px] uppercase tracking-widest text-indigo-300">
              AI Prompt Premium
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAdminAuth ? (
            <Link
              href="/admin"
              className="rounded-lg bg-indigo-500/10 border border-indigo-400/30 px-3 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition flex items-center gap-1.5"
            >
              <span>⚡</span> Panel Pengelola
            </Link>
          ) : (
            <Link
              href="/admin"
              aria-label="Admin Control Panel"
              className="rounded-lg px-2.5 py-2 text-xs text-slate-600 hover:text-slate-400 transition"
            >
              🛡️
            </Link>
          )}

          <Link
            href="/masuk"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-white"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90"
          >
            Daftar Premium
          </Link>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 md:hidden"
          aria-label="Menu"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-indigo-500/10 border border-indigo-400/20 px-3 py-2 text-center text-xs font-bold text-indigo-300"
            >
              ⚡ Control Panel Admin
            </Link>

            <div className="mt-2 flex gap-2">
              <Link
                href="/masuk"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Daftar Premium
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
