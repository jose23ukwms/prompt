"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ promptId }: { promptId: number }) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, author: author.trim() || "Anonim", rating, comment }),
      });
      if (res.ok) {
        setDone(true);
        setComment("");
        setAuthor("");
        router.refresh();
        setTimeout(() => setDone(false), 2500);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="text-sm font-semibold text-white">Tulis Ulasan</h3>
      <div className="mt-3 flex items-center gap-1 text-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            className={(hover || rating) > i ? "text-amber-400" : "text-slate-600"}
          >
            ★
          </button>
        ))}
      </div>
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Nama (opsional)"
        className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Bagikan pengalamanmu menggunakan prompt ini..."
        rows={3}
        className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
      />
      <button
        disabled={loading}
        className="mt-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Mengirim..." : done ? "✓ Terkirim!" : "Kirim Ulasan"}
      </button>
    </form>
  );
}
