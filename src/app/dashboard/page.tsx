"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientId } from "@/lib/client";
import PromptCard from "@/components/PromptCard";
import type { PromptRow } from "@/lib/types";

const TABS = [
  { id: "favorit", label: "❤️ Favorit" },
  { id: "notifikasi", label: "🔔 Notifikasi" },
  { id: "membership", label: "💎 Membership" },
  { id: "pengaturan", label: "⚙️ Pengaturan" },
];

type ProfileData = {
  id: number;
  name: string;
  email: string;
  planSlug: string;
  status: string;
  role: string;
  createdAt: string;
};

type NotifData = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const PLAN_LABELS: Record<string, string> = {
  free: "Gratis",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("favorit");
  const [favorites, setFavorites] = useState<PromptRow[]>([]);
  const [notifs, setNotifs] = useState<NotifData[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("sd_user_email");
    const clientId = getClientId();

    // Load favorites
    fetch(`/api/favorites?clientId=${clientId}`)
      .then((r) => r.json())
      .then(async (d: { ids?: number[] }) => {
        const ids = d.ids ?? [];
        if (ids.length === 0) {
          setFavorites([]);
          return;
        }
        const res = await fetch(`/api/prompts?ids=${ids.join(",")}`);
        const data = await res.json();
        setFavorites(data.prompts ?? []);
      })
      .finally(() => setLoading(false));

    // Load profile + notifications
    if (storedEmail) {
      fetch(`/api/user/profile?email=${storedEmail}`)
        .then((r) => r.json())
        .then((data) => {
          setProfile(data.profile ?? null);
          setNotifs(data.notifications ?? []);
        });
    }
  }, []);

  const isLoggedIn = !!profile;
  const isActive = profile?.status === "active";
  const isPremium = profile?.planSlug !== "free" && isActive;
  const isPending = profile?.status === "pending";

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  function handleLogout() {
    localStorage.removeItem("sd_user_email");
    localStorage.removeItem("sd_user_plan");
    localStorage.removeItem("sd_user_status");
    localStorage.removeItem("sd_user_name");
    setProfile(null);
    setNotifs([]);
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`grid h-16 w-16 place-items-center rounded-2xl text-2xl font-black ${
          isPremium ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-indigo-500 to-fuchsia-500"
        }`}>
          {isLoggedIn ? profile.name.charAt(0).toUpperCase() : "?"}
        </div>
        <div>
          <h1 className="text-2xl font-black">
            {isLoggedIn ? `Halo, ${profile.name} 👋` : "Halo, Pengguna 👋"}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                  isPremium
                    ? "bg-amber-500 text-slate-900"
                    : "bg-slate-700 text-slate-300"
                }`}>
                  {PLAN_LABELS[profile.planSlug] || profile.planSlug}
                </span>
                <span className={`text-xs font-medium ${
                  isActive ? "text-emerald-400" : isPending ? "text-amber-400" : "text-rose-400"
                }`}>
                  ● {profile.status}
                </span>
              </>
            ) : (
              <span className="text-sm text-slate-400">
                Belum masuk —{" "}
                <Link href="/masuk" className="text-indigo-300 hover:text-indigo-200">
                  Masuk
                </Link>{" "}
                atau{" "}
                <Link href="/daftar" className="text-indigo-300 hover:text-indigo-200">
                  Daftar
                </Link>
              </span>
            )}
          </div>
        </div>
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="ml-auto rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white"
          >
            Keluar
          </button>
        )}
      </div>

      {/* Pending banner */}
      {isPending && (
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 flex items-start gap-4">
          <span className="text-2xl">⏳</span>
          <div>
            <h3 className="font-bold text-amber-200">Akun Menunggu Verifikasi</h3>
            <p className="mt-1 text-sm text-amber-100/70">
              Pembayaran Anda sedang diverifikasi oleh admin. Setelah disetujui, 
              semua benefit paket <b>{PLAN_LABELS[profile.planSlug]}</b> akan langsung aktif.
              Cek tab Notifikasi untuk update.
            </p>
          </div>
        </div>
      )}

      {/* Benefit aktif */}
      {isPremium && (
        <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
          <h3 className="text-sm font-bold text-emerald-200">
            ✅ Benefit Aktif — {PLAN_LABELS[profile.planSlug]}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              "Semua prompt premium",
              "Prompt baru setiap minggu",
              "Template & AI Workflow",
              "Copy tanpa batas",
              "Support prioritas",
            ].map((b) => (
              <span key={b} className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                ✓ {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition flex items-center gap-1.5 ${
              tab === t.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
            {t.id === "notifikasi" && unreadCount > 0 && (
              <span className="grid h-4 min-w-[16px] place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {/* Favorit */}
        {tab === "favorit" && (
          <div>
            {loading ? (
              <p className="text-slate-400">Memuat...</p>
            ) : favorites.length === 0 ? (
              <Empty
                icon="💔"
                title="Belum ada favorit"
                text="Simpan prompt yang kamu suka dengan menekan ikon hati."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((p) => (
                  <PromptCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifikasi */}
        {tab === "notifikasi" && (
          <div className="space-y-3">
            {notifs.length === 0 ? (
              <Empty
                icon="🔔"
                title="Belum ada notifikasi"
                text="Semua info terkait akun dan pesananmu akan muncul di sini."
              />
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition ${
                    n.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : n.type === "warning"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-white/10 bg-white/5"
                  } ${!n.isRead ? "ring-1 ring-indigo-400/30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-white">{n.title}</h3>
                    {!n.isRead && (
                      <span className="rounded-full bg-indigo-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        BARU
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{n.message}</p>
                  <p className="mt-2 text-[10px] text-slate-600 uppercase font-bold">
                    {new Date(n.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Membership */}
        {tab === "membership" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h2 className="text-lg font-bold">Detail Membership</h2>
              {isLoggedIn ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Nama</span>
                    <span className="font-medium text-white">{profile.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Email</span>
                    <span className="font-medium text-white">{profile.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Paket</span>
                    <span className={`font-bold ${isPremium ? "text-amber-300" : "text-slate-300"}`}>
                      {PLAN_LABELS[profile.planSlug] || profile.planSlug}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-medium ${
                      isActive ? "text-emerald-400" : isPending ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {profile.status === "active" ? "Aktif" : profile.status === "pending" ? "Menunggu Verifikasi" : profile.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terdaftar</span>
                    <span className="font-medium text-white">
                      {new Date(profile.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  Anda belum masuk. <Link href="/masuk" className="text-indigo-300">Masuk</Link> atau <Link href="/daftar" className="text-indigo-300">Daftar</Link> untuk melihat detail membership.
                </p>
              )}
            </div>

            {(!isLoggedIn || profile.planSlug === "free") && (
              <div className="rounded-2xl bg-gradient-to-br from-indigo-600/30 to-fuchsia-600/20 p-6 border border-indigo-500/30">
                <h3 className="font-bold text-white">Upgrade ke Premium Pro</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Akses tanpa batas ke semua prompt premium, update mingguan, dan support prioritas.
                </p>
                <Link
                  href="/daftar"
                  className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-200 transition"
                >
                  Daftar Sekarang →
                </Link>
              </div>
            )}

            {isPending && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6">
                <h3 className="font-bold text-amber-200">⏳ Pembayaran Sedang Diverifikasi</h3>
                <p className="mt-1 text-sm text-amber-100/70">
                  Admin akan segera memproses pembayaran Anda. Anda akan menerima notifikasi
                  setelah akun diaktifkan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pengaturan */}
        {tab === "pengaturan" && (
          <div className="max-w-lg space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-bold">Pengaturan Akun</h2>
            <Field label="Nama Tampilan" value={profile?.name ?? ""} />
            <Field label="Email" value={profile?.email ?? ""} />
            <div>
              <label className="text-xs font-medium text-slate-400">Tema</label>
              <div className="mt-1 flex gap-2">
                <span className="rounded-lg border border-indigo-400 bg-indigo-500/20 px-3 py-2 text-sm">🌙 Dark</span>
                <span className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400">☀️ Light</span>
              </div>
            </div>
            <button className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold">
              Simpan Perubahan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
      <p className="text-4xl">{icon}</p>
      <p className="mt-3 font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
      <Link href="/prompts" className="mt-4 inline-block text-sm text-indigo-300">
        Jelajahi prompt →
      </Link>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400">{label}</label>
      <input
        defaultValue={value}
        placeholder={label}
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
      />
    </div>
  );
}
