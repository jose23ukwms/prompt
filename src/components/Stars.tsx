export default function Stars({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const cls = size === "md" ? "text-base" : "text-xs";
  return (
    <span className={`inline-flex items-center ${cls} text-amber-400`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i} className="opacity-70">★</span>;
        return (
          <span key={i} className="text-slate-600">
            ★
          </span>
        );
      })}
    </span>
  );
}
