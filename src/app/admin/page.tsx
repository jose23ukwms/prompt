"use client";

import { useState } from "react";
import Link from "next/link";
import AdminGate, { useAdminSession } from "@/components/admin/AdminGate";
import OverviewTab from "@/components/admin/OverviewTab";
import PromptsTab from "@/components/admin/PromptsTab";
import OrdersTab from "@/components/admin/OrdersTab";
import CustomersTab from "@/components/admin/CustomersTab";
import DataTab from "@/components/admin/DataTab";

const NAV = [
  { id: "overview", label: "Ringkasan", icon: "📊" },
  { id: "prompts", label: "Prompt", icon: "📦" },
  { id: "orders", label: "Pesanan", icon: "🧾" },
  { id: "customers", label: "Pengelola User", icon: "👥" },
  { id: "data", label: "Data", icon: "🗄️" },
];

export default function AdminPanel() {
  const { session, checked, login, logout } = useAdminSession();
  const [tab, setTab] = useState("overview");
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <AdminGate session={session} checked={checked} onLogin={login}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex max-w-[1400px]">
          {/* Sidebar */}
          <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-slate-950/80 px-4 py-6 lg:flex">
            <Link href="/" className="mb-8 flex items-center gap-2 px-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-black">
                S
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold">Control Panel</p>
                <p className="text-[10px] uppercase tracking-widest text-indigo-300">Start Digital</p>
              </div>
            </Link>

            <nav className="flex flex-1 flex-col gap-1">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    tab === n.id ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {tab === n.id && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-fuchsia-400" />
                  )}
                  <span className="text-base">{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </nav>

            <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-xs font-bold">
                  {session?.name?.charAt(0).toUpperCase() ?? "A"}
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-white">{session?.name}</p>
                  <p className="text-[10px] uppercase tracking-wide text-indigo-300">{session?.role}</p>
                </div>
              </div>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <span>🌐</span> Lihat Situs
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                <span>🚪</span> Keluar
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1">
            {/* Topbar */}
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileNav((o) => !o)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 lg:hidden"
                >
                  ☰
                </button>
                <div>
                  <h1 className="text-lg font-black tracking-tight">
                    {NAV.find((n) => n.id === tab)?.label}
                  </h1>
                  <p className="text-xs text-slate-500">Kelola seluruh platform dari satu tempat.</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  ● Online
                </span>
              </div>
            </header>

            {/* Mobile nav */}
            {mobileNav && (
              <div className="border-b border-white/10 bg-slate-950/95 px-4 py-3 lg:hidden">
                <div className="grid grid-cols-2 gap-2">
                  {NAV.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setTab(n.id);
                        setMobileNav(false);
                      }}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                        tab === n.id ? "bg-white/10 text-white" : "bg-white/[0.03] text-slate-400"
                      }`}
                    >
                      <span>{n.icon}</span> {n.label}
                    </button>
                  ))}
                  <button onClick={logout} className="col-span-2 rounded-xl bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
                    🚪 Keluar
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <main key={tab} className="px-5 py-6 sm:px-7" style={{ animation: "panelIn 0.35s ease" }}>
              {tab === "overview" && <OverviewTab onGoto={setTab} />}
              {tab === "prompts" && <PromptsTab />}
              {tab === "orders" && <OrdersTab />}
              {tab === "customers" && <CustomersTab />}
              {tab === "data" && <DataTab />}
            </main>
          </div>
        </div>
        <style>{`@keyframes panelIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    </AdminGate>
  );
}
