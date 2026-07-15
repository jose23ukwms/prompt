"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePromptButton({
  id,
  onDeleted,
}: {
  id: number;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function del() {
    if (!confirm("Hapus prompt ini?")) return;
    setLoading(true);
    try {
      await fetch("/api/admin/prompts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (onDeleted) onDeleted();
      else router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={del}
      disabled={loading}
      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
    >
      {loading ? "..." : "Hapus"}
    </button>
  );
}
