import { db } from "@/db";
import { categories, plans, prompts } from "@/db/schema";
import { categoriesSeed, plansSeed } from "@/db/seed-data";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const appTypes = [
  "Landing Page Modern", "SaaS Dashboard", "E-Commerce Platform", "Blog CMS", "Booking System",
  "Task Management", "Company Portal", "Social Media App", "Learning Management", "Portfolio App",
  "Inventory Management", "Chat Application", "Finance Tracker", "Restaurant Ordering", "API Management Tool",
  "Job Board", "Knowledge Base", "Fitness Tracker", "Real Estate Listing", "Event Management",
  "Survey Poll App", "CRM Mini", "File Sharing", "Time Tracking", "Recipe Planner",
  "Community Forum", "Password Manager", "Application Tracker", "Expense Splitter", "AI Chatbot Builder",
  "Newsletter Platform", "Habit Tracker", "Collaborative Whiteboard", "Price Comparison", "QR Business Card",
  "Code Snippet Manager", "Fundraising Platform", "Markdown Notes", "Fleet Tracker", "URL Shortener",
  "Digital Signage", "Finance Dashboard", "Bug Tracker", "AI Recipe Generator", "Subscription Management",
  "OCR Document Scanner", "Team Scheduling", "Auction Platform", "SEO Analytics", "Admin Panel Generator",
];

const backends = ["Google Apps Script", "Firebase", "Supabase", "Appwrite", "PocketBase", "Nhost", "Node.js + Express", "PostgreSQL API"];
const storages = ["Google Sheets", "Firestore NoSQL", "PostgreSQL", "Appwrite Database", "PocketBase SQLite", "Hasura PostgreSQL", "MongoDB Atlas", "Vector Database"];
const hostings = ["Vercel", "Netlify", "Firebase Hosting", "Cloudflare Pages", "VPS Ubuntu + Nginx", "Railway", "Fly.io", "Docker Compose di VPS"];
const followUps = [
  "Refactor seluruh kode agar modular, typed, dan production-ready dengan dokumentasi setiap folder.",
  "Tambahkan sistem login, role admin/user, dan validasi akses untuk fitur premium atau area dashboard.",
  "Buat panduan deployment lengkap ke VPS dengan Nginx, SSL Certbot, PM2/Docker, dan environment variables.",
  "Tambahkan strategi backup database, migration, seed data, dan recovery plan agar data tidak hilang.",
  "Tambahkan test plan: unit test, integration test, smoke test, dan checklist sebelum go-live.",
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 180);
}

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

function buildGenericPrompt(index: number, isPremium: boolean, categoryId: number) {
  const topic = isPremium ? "workflow bisnis otomatis" : "konten dan produktivitas dasar";
  const title = `${isPremium ? "Premium" : "Gratis"} Prompt ${topic} #${index}`;
  return {
    slug: `${isPremium ? "auto-premium" : "auto-free"}-${index}-${Date.now().toString(36)}`,
    title,
    description: `Prompt ${isPremium ? "premium" : "gratis"} untuk membantu membuat ${topic} dengan output terstruktur dan siap pakai.`,
    categoryId,
    content: `Bertindaklah sebagai ahli ${topic}. Buatkan output lengkap berdasarkan kebutuhan berikut: [ISI KEBUTUHAN]. Sertakan konteks, langkah implementasi, contoh hasil, dan checklist validasi. Gunakan bahasa Indonesia yang jelas dan profesional.`,
    usage: "Ganti [ISI KEBUTUHAN] dengan detail kebutuhan Anda, lalu jalankan di ChatGPT/Claude/Gemini.",
    exampleOutput: "1. Ringkasan kebutuhan\n2. Strategi\n3. Langkah implementasi\n4. Checklist validasi",
    level: isPremium ? "Menengah" : "Pemula",
    language: "Indonesia",
    supportedAi: ["ChatGPT", "Claude", "Gemini", "DeepSeek"],
    tags: isPremium ? ["premium", "workflow", "bisnis", "otomatisasi"] : ["gratis", "produktivitas", "konten"],
    followUps: followUps.slice(0, 3),
    isPremium,
    isTrending: index <= 10,
    isBestSeller: index <= 5,
    usersCount: 100 + index * 3,
    copyCount: 200 + index * 4,
    ratingSum: 95,
    ratingCount: 20,
    version: "1.0",
  };
}

function buildAppPrompt(index: number, codingId: number) {
  const app = appTypes[index - 1];
  const backend = pick(backends, index);
  const storage = pick(storages, index + 2);
  const hosting = pick(hostings, index + 4);
  return {
    slug: `app-builder-seed-${index}`,
    title: `Buat Aplikasi ${app} dari Nol`,
    description: `Prompt end-to-end untuk membuat ${app}: frontend, ${backend}, ${storage}, dan deploy ke ${hosting}.`,
    categoryId: codingId,
    content: `Bertindaklah sebagai senior fullstack architect. Bangun aplikasi ${app} dari nol sampai production.\n\nStack yang harus digunakan:\n- Backend: ${backend}\n- Penyimpanan data: ${storage}\n- Hosting/deployment: ${hosting}\n\nBerikan output lengkap:\n1. Arsitektur dan struktur folder\n2. Skema database/koleksi/spreadsheet\n3. Backend/API lengkap\n4. Frontend UI dan state management\n5. Auth dan role admin/user\n6. Cara deploy ke ${hosting}\n7. Checklist go-live, backup, dan monitoring\n\nKode harus lengkap, bukan pseudocode. Jika ada pilihan teknis, jelaskan plus-minusnya.`,
    usage: "Isi nama brand, fitur inti, dan preferensi backend/database sebelum menjalankan prompt ini.",
    exampleOutput: `Struktur project ${app}: /frontend, /backend, /db, /deploy. Backend: ${backend}. Database: ${storage}. Deploy: ${hosting}.`,
    level: "Lanjutan",
    language: "Indonesia",
    supportedAi: ["ChatGPT", "Claude", "DeepSeek", "Copilot"],
    tags: ["website", "web app", "aplikasi", "app builder", "fullstack", "backend", "database", "hosting", "deploy", backend.toLowerCase(), storage.toLowerCase()],
    followUps: [followUps[index % followUps.length], followUps[(index + 1) % followUps.length], followUps[(index + 2) % followUps.length]],
    isPremium: true,
    isTrending: index <= 10,
    isBestSeller: index <= 5,
    usersCount: 500 + index * 11,
    copyCount: 800 + index * 13,
    ratingSum: 98,
    ratingCount: 21,
    version: "1.0",
  };
}

async function ensureBaseData() {
  const catRows = await db.select().from(categories);
  if (catRows.length === 0) {
    await db.insert(categories).values(categoriesSeed);
  }
  const planRows = await db.select().from(plans);
  if (planRows.length === 0) {
    await db.insert(plans).values(plansSeed);
  }
  return db.select().from(categories);
}

export async function POST() {
  const cats = await ensureBaseData();
  const coding = cats.find((c) => c.slug === "coding") ?? cats[0];
  const fallbackCategory = cats[0];

  const [before] = await db
    .select({
      free: sql<number>`count(*) filter (where ${prompts.isPremium} = false)`.mapWith(Number),
      premium: sql<number>`count(*) filter (where ${prompts.isPremium} = true)`.mapWith(Number),
      app: sql<number>`count(*) filter (where ${prompts.slug} like 'app-%')`.mapWith(Number),
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(prompts);

  let insertedFree = 0;
  let insertedPremium = 0;
  let insertedApp = 0;

  const freeMissing = Math.max(0, 70 - before.free);
  if (freeMissing) {
    await db.insert(prompts).values(
      Array.from({ length: freeMissing }, (_, i) => buildGenericPrompt(before.free + i + 1, false, pick(cats, i).id ?? fallbackCategory.id))
    );
    insertedFree = freeMissing;
  }

  const appMissing = Math.max(0, 50 - before.app);
  if (appMissing) {
    const existingApp = new Set(
      (await db.select({ slug: prompts.slug }).from(prompts).where(sql`${prompts.slug} like 'app-%'`)).map((r) => r.slug)
    );
    const appValues = Array.from({ length: 50 }, (_, i) => buildAppPrompt(i + 1, coding.id)).filter((p) => !existingApp.has(p.slug)).slice(0, appMissing);
    if (appValues.length) await db.insert(prompts).values(appValues);
    insertedApp = appValues.length;
  }

  const [mid] = await db.select({ premium: sql<number>`count(*) filter (where ${prompts.isPremium} = true)`.mapWith(Number) }).from(prompts);
  const premiumMissing = Math.max(0, 1130 - mid.premium);
  if (premiumMissing) {
    await db.insert(prompts).values(
      Array.from({ length: premiumMissing }, (_, i) => buildGenericPrompt(mid.premium + i + 1, true, pick(cats, i + 3).id ?? fallbackCategory.id))
    );
    insertedPremium = premiumMissing;
  }

  const [after] = await db
    .select({
      free: sql<number>`count(*) filter (where ${prompts.isPremium} = false)`.mapWith(Number),
      premium: sql<number>`count(*) filter (where ${prompts.isPremium} = true)`.mapWith(Number),
      app: sql<number>`count(*) filter (where ${prompts.slug} like 'app-%')`.mapWith(Number),
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(prompts);

  return Response.json({
    ok: true,
    message: "Database sudah dipastikan berisi prompt minimum untuk produksi tanpa menghapus data lama.",
    inserted: { free: insertedFree, appBuilder: insertedApp, premium: insertedPremium },
    before,
    after,
  });
}

export async function GET() {
  return POST();
}
