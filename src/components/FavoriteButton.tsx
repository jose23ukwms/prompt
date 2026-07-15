"use client";

import { useEffect, useState } from "react";
import { getClientId } from "@/lib/client";

export default function FavoriteButton({
  promptId,
  compact = false,
}: {
  promptId: number;
  compact?: boolean;
}) {
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientId = getClientId();
    if (!clientId) return;
    fetch(`/api/favorites?clientId=${clientId}`)
      .then((r) => r.json())
      .then((d: { ids?: number[] }) => setFav((d.ids ?? []).includes(promptId)))
      .catch(() => {});
  }, [promptId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const clientId = getClientId();
    const next = !fav;
    setFav(next);
    try {
      await fetch("/api/favorites", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, promptId }),
      });
    } catch {
      setFav(!next);
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label="Simpan ke favorit"
        className={`grid h-6 w-6 place-items-center rounded-full text-sm transition ${
          fav ? "text-rose-400" : "text-slate-500 hover:text-rose-300"
        }`}
      >
        {fav ? "♥" : "♡"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
        fav
          ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
          : "border-white/10 bg-white/5 text-slate-200 hover:border-rose-500/30"
      }`}
    >
      {fav ? "♥ Tersimpan" : "♡ Simpan ke Favorit"}
    </button>
  );
}
