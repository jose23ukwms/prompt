import { db } from "@/db";
import { categories, plans, prompts } from "@/db/schema";
import { categoriesSeed, plansSeed } from "@/db/seed-data";
import { GAS_APP_IDEAS, GAS_PRO_SPECS } from "@/db/seed-gas-data";
import { buildAutomatedFollowUps } from "@/lib/prompt-audit";
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
      gas: sql<number>`count(*) filter (where ${prompts.slug} like 'gas-%')`.mapWith(Number),
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

  // Seeding GAS Prompts (50 basic + 30 pro)
  let insertedGas = 0;
  const gasMissing = Math.max(0, 80 - before.gas);
  if (gasMissing > 0) {
    const existingGas = new Set(
      (await db.select({ slug: prompts.slug }).from(prompts).where(sql`${prompts.slug} like 'gas-%'`)).map((r) => r.slug)
    );
    
    // Generate basic GAS prompts
    const gasValues = GAS_APP_IDEAS.map((idea, index) => {
      const slug = `gas-${slugify(idea.name)}-${index + 1}`;
      return {
        slug,
        title: `Buat Aplikasi ${idea.name} dengan Google Apps Script + Google Sheets`.slice(0, 240),
        description: `Aplikasi ${idea.name} lengkap menggunakan Google Apps Script sebagai backend dan Google Sheets sebagai database. Bisa langsung diakses via URL Web App.`,
        categoryId: coding.id,
        content: `Buat aplikasi web lengkap **${idea.name}** menggunakan **Google Apps Script sebagai backend** dan **Google Sheets sebagai database**.\n\n## Teknologi yang WAJIB digunakan:\n- **Frontend**: HTML + CSS + JavaScript (bisa pakai Bootstrap 5 atau Tailwind via CDN)\n- **Backend**: Google Apps Script (doGet, doPost, spreadsheet operations)\n- **Database**: Google Sheets dengan struktur tabel yang efisien\n- **Deployment**: Web App via Google Apps Script (URL publik)\n\n## Fitur yang harus ada:\n1. **CRUD Lengkap** untuk semua entitas utama\n2. **Autentikasi sederhana** (email + password atau Google Sign-In via GAS)\n3. **Dashboard** dengan ringkasan data\n4. **Form input** yang user-friendly\n5. **Tabel data** dengan fitur search, filter, dan pagination\n6. **Export ke Excel/PDF**\n7. **Validasi data** di frontend & backend\n\n## Struktur Google Sheets yang direkomendasikan:\n${idea.sheets.map((s) => `- Sheet "${s}"`).join("\n")}\n\n## Struktur Kode yang diharapkan:\n1. \`Code.gs\` - Backend logic (doGet, doPost, CRUD functions)\n2. \`Index.html\` - Frontend utama (HTML + CSS + JS)\n3. \`Utils.gs\` - Helper functions\n4. \`Auth.gs\` - Autentikasi & otorisasi\n\n## Instruksi Output:\nBerikan kode **lengkap** untuk setiap file, bukan pseudocode. Sertakan:\n- Penjelasan cara membuat Google Sheet baru\n- Cara menghubungkan script dengan spreadsheet\n- Cara deploy sebagai Web App\n- Cara mendapatkan URL Web App\n- Contoh data awal untuk setiap sheet\n\nPastikan aplikasi bisa langsung digunakan setelah di-deploy.`,
        usage: "1. Buat Google Sheet baru sesuai struktur yang diberikan\n2. Buat project Google Apps Script baru\n3. Copy-paste semua kode yang diberikan\n4. Hubungkan script dengan spreadsheet ID\n5. Deploy sebagai Web App (Execute as: Me, Who has access: Anyone)\n6. Buka URL yang diberikan",
        exampleOutput: `Aplikasi ${idea.name} siap digunakan:\n- URL Web App: https://script.google.com/macros/s/...\n- Fitur: CRUD, Dashboard, Export, Search\n- Database: Google Sheets (real-time sync)`,
        level: "Menengah",
        language: "Indonesia",
        supportedAi: ["ChatGPT", "Claude", "Gemini", "DeepSeek"],
        tags: ["google-apps-script", "google-sheets", "web-app", "no-code", "backend", "database", "deploy", "gas"],
        followUps: buildAutomatedFollowUps([
          "Tambahkan fitur export PDF dan kirim email otomatis.",
          "Buat sistem autentikasi yang lebih aman dengan session & role.",
          "Optimasi performa untuk data yang sangat besar (ribuan baris).",
        ], `Buat Aplikasi ${idea.name}`, "Coding"),
        isPremium: true,
        isTrending: index <= 10,
        isBestSeller: index <= 5,
        usersCount: 300 + index * 7,
        copyCount: 500 + index * 9,
        ratingSum: 92,
        ratingCount: 19,
        version: "1.0",
      };
    });

    // Generate pro GAS prompts
    const gasProValues = GAS_PRO_SPECS.map((spec, index) => {
      const slug = `gas-pro-${slugify(spec.name)}-${index + 1}`;
      return {
        slug,
        title: `Production GAS App: ${spec.name}`,
        description: `Blueprint production-grade untuk ${spec.name} memakai Google Apps Script sebagai backend, Google Sheets sebagai database, dan URL Web App publik.`,
        categoryId: coding.id,
        content: `Bertindaklah sebagai Principal Software Engineer dan Google Apps Script architect. Bangun aplikasi production-grade "${spec.name}" dari nol sampai dapat digunakan melalui URL Google Apps Script Web App.\n\n## Tujuan Bisnis\nAplikasi harus ${spec.outcome} untuk ${spec.audience}. Jangan membuat demo kosong. Semua alur harus punya data model, validasi, error state, dan acceptance criteria yang dapat diuji.\n\n## Stack Non-Negotiable\n- Frontend: HTML5, CSS modern, vanilla JavaScript modular, Bootstrap 5 atau Tailwind via CDN hanya untuk UI.\n- Backend: Google Apps Script dengan doGet, doPost, service layer, validation layer, dan response JSON konsisten.\n- Database: satu Google Spreadsheet sebagai database dengan tab: ${spec.sheets.map((s) => `"${s}"`).join(", ")}.\n- Deployment: Google Apps Script Web App dengan Execute as: Me dan access policy yang dijelaskan secara aman.\n- Config: Spreadsheet ID, allowed origin, email admin, dan feature flags di PropertiesService; tidak boleh hardcode secret.\n\n## Fitur Wajib\n${spec.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n- CRUD lengkap dengan ID UUID, createdAt, updatedAt, createdBy, dan soft-delete bila relevan.\n- Dashboard responsive dengan loading, empty, success, validation, unauthorized, quota, dan server-error state.\n- Search, filter, sort, pagination, export CSV/PDF bila relevan, dan audit log perubahan penting.\n\n## Aturan Engineering Google Sheets\n- Gunakan header schema yang eksplisit dan fungsi ensureSheets/ensureHeaders yang idempotent.\n- Gunakan LockService untuk semua operasi tulis yang berisiko race condition.\n- Baca/tulis batch dengan getValues/setValues; hindari getRange di dalam loop.\n- Validasi allowlist field, normalisasi tipe tanggal/angka, panjang string, dan sanitasi formula injection.\n- Gunakan CacheService/PropertiesService secara tepat; pahami batas quota Apps Script dan berikan fallback.\n- Jangan simpan password plaintext. Jelaskan opsi akses Google account/domain atau token berumur pendek.\n- Jangan menaruh API key di HTML; secret hanya di Script Properties atau server-side service.\n\n## Output yang Harus Diberikan AI\n1. Architecture decision record dan flow data.\n2. Struktur file: Code.gs, Config.gs, Auth.gs, Validation.gs, Repository.gs, Service.gs, Index.html, styles.html, app.html, serta test plan.\n3. Kode lengkap setiap file, bukan pseudocode.\n4. Header dan contoh row untuk setiap sheet.\n5. Kontrak API: request, response sukses, validation error, unauthorized, quota error, dan server error.\n6. Acceptance criteria yang bisa dicentang untuk setiap fitur.\n7. Test cases untuk CRUD, concurrent write, invalid input, empty data, quota, akses publik, dan recovery.\n8. Panduan deploy Web App, pengaturan access policy, Script Properties, versi deployment, rollback, dan monitoring.\n9. Batasan skala Google Sheets serta rencana migrasi ke Supabase/PostgreSQL jika volume melebihi quota.\n\n## Quality Gate\nSebelum final, lakukan self-review terhadap keamanan, validasi, race condition, performa, aksesibilitas, mobile layout, quota Apps Script, dan kesiapan deployment. Jika requirement ambigu, tulis asumsi dan pertanyaan klarifikasi terlebih dahulu. Output akhir harus profesional, konsisten, dapat diuji, dan siap dipelihara.`,
        usage: "Tempel prompt ini ke AI, isi nama organisasi dan aturan bisnis yang spesifik, lalu implementasikan file per file. Deploy sebagai Web App hanya setelah acceptance criteria dan test plan lulus.",
        exampleOutput: `Output harus mencakup arsitektur, schema tabs (${spec.sheets.join(", ")}), source code lengkap, API contract, test cases, dan deployment runbook untuk ${spec.name}.`,
        level: "Lanjutan",
        language: "Indonesia",
        supportedAi: ["ChatGPT", "Claude", "Gemini", "DeepSeek"],
        tags: ["google-apps-script", "google-sheets", "web-app", "production-ready", "software", "automation", "backend", "database", "deployment", "qa"],
        followUps: buildAutomatedFollowUps([], `Production GAS App: ${spec.name}`, "Coding"),
        isPremium: true,
        isTrending: index < 10,
        isBestSeller: index < 5,
        usersCount: 650 + index * 17,
        copyCount: 950 + index * 23,
        ratingSum: 98,
        ratingCount: 21,
        version: "1.0",
      };
    });

    const combinedGas = [...gasValues, ...gasProValues].filter(p => !existingGas.has(p.slug));
    if (combinedGas.length) {
      await db.insert(prompts).values(combinedGas);
      insertedGas = combinedGas.length;
    }
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
      gas: sql<number>`count(*) filter (where ${prompts.slug} like 'gas-%')`.mapWith(Number),
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(prompts);

  return Response.json({
    ok: true,
    message: "Database sudah dipastikan berisi prompt minimum untuk produksi tanpa menghapus data lama.",
    inserted: { free: insertedFree, appBuilder: insertedApp, gas: insertedGas, premium: insertedPremium },
    before,
    after,
  });
}

export async function GET() {
  return POST();
}
