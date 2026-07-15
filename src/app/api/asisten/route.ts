import { getPrompts, type PromptRow } from "@/lib/queries";

export const dynamic = "force-dynamic";

const STOP = new Set([
  "yang", "untuk", "dan", "atau", "saya", "ingin", "mau", "buat", "buatkan",
  "dengan", "di", "ke", "dari", "ada", "bisa", "tolong", "prompt", "ai", "the",
  "a", "an", "for", "to", "please", "want", "need", "make", "sebuah", "agar",
  "bagaimana", "cara", "adalah", "itu", "ini", "akan", "pada", "membuat", "bikin",
]);

const SYNONYMS: Record<string, string[]> = {
  website: ["web", "landing", "landing page", "fullstack", "app builder", "frontend", "hosting", "deploy", "cms", "portfolio"],
  web: ["website", "landing", "fullstack", "frontend", "backend", "deploy"],
  aplikasi: ["app", "web app", "fullstack", "frontend", "backend", "database", "deploy"],
  app: ["aplikasi", "web app", "fullstack", "frontend", "backend", "database", "deploy"],
  landing: ["website", "landing page", "cta", "frontend", "seo"],
  landingpage: ["landing", "website", "landing page", "cta", "seo"],
  backend: ["firebase", "supabase", "appwrite", "pocketbase", "nhost", "postgresql", "database", "api"],
  database: ["postgresql", "supabase", "firebase", "firestore", "nosql", "sql", "google sheets", "spreadsheet", "vector"],
  hosting: ["deploy", "vps", "vercel", "netlify", "firebase hosting", "cloudflare", "railway"],
  deploy: ["hosting", "vps", "vercel", "netlify", "cloudflare", "docker"],
  supabase: ["postgresql", "auth", "storage", "realtime", "database"],
  firebase: ["firestore", "auth", "hosting", "cloud functions", "database"],
  spreadsheet: ["google sheets", "google apps script", "gas", "database"],
};

const PHRASE_INTENTS = [
  {
    match: ["buat website", "membuat website", "bikin website", "buat web", "website dari nol"],
    tokens: ["website", "landing", "fullstack", "frontend", "backend", "database", "hosting", "deploy", "app builder"],
  },
  {
    match: ["buat aplikasi", "membuat aplikasi", "bikin aplikasi", "web app", "aplikasi web"],
    tokens: ["aplikasi", "app", "fullstack", "frontend", "backend", "database", "deploy", "app builder"],
  },
  {
    match: ["landing page", "landingpage", "halaman penjualan"],
    tokens: ["landing", "website", "cta", "seo", "copywriting", "frontend"],
  },
];

function tokenize(s: string) {
  const normalized = s.toLowerCase();
  const base = normalized
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

  const expanded = new Set(base);
  for (const token of base) {
    for (const syn of SYNONYMS[token] ?? []) expanded.add(syn);
  }
  for (const intent of PHRASE_INTENTS) {
    if (intent.match.some((m) => normalized.includes(m))) {
      intent.tokens.forEach((t) => expanded.add(t));
    }
  }
  return [...expanded];
}

function scorePrompt(p: PromptRow, tokens: string[]) {
  const title = p.title.toLowerCase();
  const tags = p.tags.map((t) => t.toLowerCase());
  const hay = (
    p.title +
    " " +
    p.description +
    " " +
    p.categoryName +
    " " +
    p.tags.join(" ") +
    " " +
    p.content.slice(0, 1000)
  ).toLowerCase();
  let score = 0;

  const isBuilderPrompt =
    tags.some((t) => ["fullstack", "app builder", "website", "web app", "aplikasi", "deploy"].some((k) => t.includes(k))) ||
    title.includes("aplikasi") ||
    title.includes("website") ||
    title.includes("landing page") ||
    title.includes("dari nol");

  const wantsWebsite = tokens.some((t) => ["website", "web", "landing", "fullstack", "app builder", "frontend", "backend", "hosting", "deploy"].includes(t));
  if (wantsWebsite && isBuilderPrompt) score += 14;

  for (const t of tokens) {
    if (title.includes(t)) score += 7;
    if (tags.some((tag) => tag.includes(t))) score += 6;
    if (p.categoryName.toLowerCase().includes(t)) score += 3;
    if (hay.includes(t)) score += 2;
  }
  score += Math.min(p.usersCount / 2000, 2);
  return score;
}

export async function POST(req: Request) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return Response.json({ ok: false, results: [] }, { status: 400 });
  }
  const tokens = tokenize(query);

  // Assistant harus mencari seluruh katalog, termasuk premium yang terkunci.
  // Hak akses tetap divalidasi di halaman detail prompt.
  const all = await getPrompts({}, 1400, true);

  const ranked = all
    .map((p) => ({ p, score: scorePrompt(p, tokens) }))
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score > 2)
    .slice(0, 5);

  const results = ranked.map(({ p }) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.categoryName,
    icon: p.categoryIcon,
    isPremium: p.isPremium,
    supportedAi: p.supportedAi,
    usage: p.usage,
    reason: buildReason(p, tokens),
  }));

  const intro =
    results.length > 0
      ? `Berdasarkan kebutuhanmu, saya menemukan ${results.length} prompt yang paling relevan. Berikut rekomendasinya beserta cara pakainya:`
      : "Saya belum menemukan prompt yang cocok. Coba jelaskan lebih spesifik, misalnya sebutkan jenis produk, backend yang diinginkan (Supabase/Firebase/GAS), database, atau tujuan website/aplikasi.";

  return Response.json({ ok: true, intro, results, debugTokens: tokens.slice(0, 20) });
}

function buildReason(p: PromptRow, tokens: string[]) {
  const matched = p.tags.filter((t) => tokens.some((tok) => t.toLowerCase().includes(tok.toLowerCase())));
  if (matched.length) {
    return `Cocok karena relevan dengan: ${matched.slice(0, 4).join(", ")}. Kategori ${p.categoryName}.`;
  }
  return `Prompt ini cocok dengan intent pembuatan website/aplikasi dan dapat disesuaikan dengan backend, database, dan hosting pilihanmu.`;
}
