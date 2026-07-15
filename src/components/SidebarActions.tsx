"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";

export default function SidebarActions({
  isPremium,
  promptId,
}: {
  isPremium: boolean;
  promptId: number;
}) {
  const [premiumUser, setPremiumUser] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("sd_user_email");
    if (!email) return;
    fetch(`/api/auth/access?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => setPremiumUser(data.isPremium === true))
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      {isPremium && !premiumUser ? (
        <Link
          href="/harga"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          🔓 Unlock Premium
        </Link>
      ) : (
        <p className="text-xs leading-relaxed text-slate-400">
          Tombol copy tersedia di panel Prompt Lengkap setelah status akses berhasil diverifikasi.
        </p>
      )}
      <div className="mt-3">
        <FavoriteButton promptId={promptId} />
      </div>
    </div>
  );
}
