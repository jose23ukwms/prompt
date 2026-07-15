import { db, pool } from "../db/index";
import { prompts, categories } from "../db/schema";
import { eq } from "drizzle-orm";

let CODING_CAT_ID: number; // akan diisi otomatis dari database saat run()

const FOLLOW_UPS_TEMPLATES = [
  "Refactor kode agar mengikuti prinsip SOLID, pisahkan ke modular components, dan tambahkan TypeScript interface untuk semua tipe data.",
  "Buatkan setup CI/CD (GitHub Actions) untuk otomatisasi testing, linting, dan deployment ke VPS/hosting saat push ke branch main.",
  "Tambahkan error handling global, logging, dan monitoring dasar (mis. health check endpoint) ke aplikasi ini.",
  "Optimasi performa: lazy loading, code splitting, image optimization, dan caching strategy sesuai platform hosting.",
  "Buat dokumentasi teknis lengkap: README, API docs, arsitektur diagram, dan panduan deployment step-by-step.",
  "Implementasikan sistem autentikasi (login, register, reset password) sesuai backend yang dipilih, lengkap dengan role management.",
  "Tambahkan fitur real-time (WebSocket/Server-Sent Events/Firebase Realtime) untuk notifikasi dan data live update.",
  "Buat unit test dan integration test untuk semua modul utama menggunakan framework testing yang sesuai (Vitest, Jest, PyTest).",
];

function genFollowUps(offset: number) {
  return [
    FOLLOW_UPS_TEMPLATES[offset % FOLLOW_UPS_TEMPLATES.length],
    FOLLOW_UPS_TEMPLATES[(offset + 2) % FOLLOW_UPS_TEMPLATES.length],
    FOLLOW_UPS_TEMPLATES[(offset + 4) % FOLLOW_UPS_TEMPLATES.length],
  ];
}

function genPrompt(
  num: number,
  appType: string,
  frontend: string,
  backend: string,
  storage: string,
  deploy: string,
  features: string,
  notes: string
) {
  const slug = `app-${appType.replace(/\s+/g, "-").toLowerCase()}-${num}`;
  const title = `Buat Aplikasi ${appType} dari Nol`;
  const desc = `Prompt lengkap membangun ${appType.toLowerCase()} end-to-end: ${frontend} + ${backend} + ${storage} + deploy ke ${deploy}.`;
  const content = `Bertindaklah sebagai senior fullstack architect. Tugas: bangun aplikasi \`${appType}\` dari nol hingga siap production.

## Stack Teknologi
- **Frontend**: ${frontend}
- **Backend**: ${backend}
- **Data/Storage**: ${storage}
- **Deployment**: ${deploy}
- **Fitur inti**: ${features}

## Instruksi
1. **Arsitektur**: Gambarkan struktur folder, diagram alur data, dan dependency antar modul.
2. **Backend Setup**: Berikan kode lengkap untuk setup ${backend}, termasuk koneksi ke ${storage}, konfigurasi environment variables, dan API endpoints.
3. **Frontend Setup**: Berikan struktur project ${frontend}, komponen utama, routing, state management, dan cara connect ke backend.
4. **Database/Storage**: Skema tabel/koleksi untuk ${storage}, lengkap dengan relasi, indeks, dan contoh seed data.
5. **Autentikasi**: Implementasi login, register, session/JWT, dan role-based access sesuai kemampuan ${backend}.
6. **Deploy**: Step-by-step guide untuk deploy ke ${deploy}, termasuk konfigurasi server, SSL, dan environment.

${notes}

## Output Format
Sajikan dalam format terstruktur: setiap bagian punya heading, kode lengkap (bukan pseudocode), komentar penjelasan, dan instruksi jalankan.`;

  const usage = `Ganti nama aplikasi, sesuaikan fitur, dan salin kode per bagian. Uji lokal dulu sebelum deploy ke ${deploy}.`;
  const example = `1. Struktur Folder: /src/app, /src/api, /src/db...\n2. Backend: ${backend} setup...\n3. Frontend: ${frontend} setup...\n4. Database: skema untuk ${storage}...\n5. Deploy: panduan ${deploy}...`;

  return {
    slug,
    title: title.slice(0, 100),
    description: desc.slice(0, 200),
    categoryId: CODING_CAT_ID,
    content,
    usage,
    exampleOutput: example,
    level: "Lanjutan",
    language: "Indonesia",
    supportedAi: ["ChatGPT", "Claude", "DeepSeek", "Copilot"],
    tags: ["fullstack", "app builder", "end-to-end", "deploy", appType.toLowerCase(), backend.toLowerCase(), storage.toLowerCase()],
    followUps: genFollowUps(num),
    isPremium: true,
    isTrending: num <= 10,
    isBestSeller: num <= 5,
    usersCount: 200 + Math.floor(Math.random() * 1800),
    copyCount: 300 + Math.floor(Math.random() * 2500),
    ratingSum: Math.floor((15 + Math.random() * 20) * (4.3 + Math.random() * 0.7)),
    ratingCount: 15 + Math.floor(Math.random() * 20),
    version: "1.0",
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 30)),
    updatedAt: new Date(),
  };
}

// 50 prompt fullstack app builder
const appPrompts = [
  genPrompt(1, "Landing Page Modern", "React + Tailwind CSS", "Google Apps Script (GAS) sebagai backend", "Google Sheets sebagai database", "Vercel / Netlify (frontend) + Cloudflare Pages", "Hero section, form kontak, CTA, SEO optimized, responsive design", "GAS bisa menyimpan form submission langsung ke Google Sheets. Cocok untuk bisnis UMKM tanpa biaya server."),
  genPrompt(2, "SaaS Dashboard", "Next.js (App Router) + shadcn/ui", "Supabase (Auth + PostgreSQL)", "PostgreSQL via Supabase", "Fly.io / Railway + Vercel", "Dashboard analitik, manajemen user, role admin/user, real-time chart, export data", "Supabase menyediakan Auth, Database, dan Row-Level Security out-of-the-box."),
  genPrompt(3, "E-Commerce Platform", "Next.js + Stripe integration", "Appwrite (Auth + Database + Storage)", "Appwrite Database (NoSQL-like)", "VPS Ubuntu 22.04 + Nginx + PM2", "Katalog produk, keranjang belanja, checkout Stripe, dashboard admin, notifikasi order", "Appwrite gratis untuk tier awal, scalable, dan support real-time subscription."),
  genPrompt(4, "Blog + CMS", "Astro + React", "PocketBase (Go backend)", "PocketBase SQLite", "VPS DigitalOcean / Hetzner", "Post CRUD, markdown editor, kategori/tag, search, SEO meta, RSS feed", "PocketBase hanya 1 binary file — sangat ringan untuk VPS, bisa hosting blog penuh dengan < 50MB RAM."),
  genPrompt(5, "Booking System", "React SPA", "Firebase (Auth + Firestore + Functions)", "Firestore NoSQL", "Firebase Hosting + Cloud Functions", "Jadwal ketersediaan, booking slot, konfirmasi email, payment reminder, kalender interaktif", "Firebase ecosystem lengkap: hosting, auth, database, functions — zero config server."),
  genPrompt(6, "Task Management App", "Vue 3 + Pinia", "Nhost (Hasura GraphQL + PostgreSQL)", "PostgreSQL + Hasura GraphQL", "Nhost Cloud atau self-host di VPS", "Board kanban, drag-drop task, assign user, due date, notifications, export CSV", "GraphQL dari Hasura memungkinkan query fleksibel tanpa rewrite API setiap perubahan."),
  genPrompt(7, "Internal Company Portal", "React + Ant Design", "Supabase + Edge Functions", "PostgreSQL via Supabase", "VPS + Docker + Docker Compose", "Announcements, employee directory, document sharing, leave request, approval flow", "Docker Compose memudahkan setup multi-service (app + db + redis) di satu VPS."),
  genPrompt(8, "Social Media Clone", "Next.js + Framer Motion", "Supabase (Auth + Storage + Realtime)", "PostgreSQL + Supabase Storage", "Vercel + Railway (backend services)", "Feed, like/comment, profile, follow system, upload foto/video, real-time notifications", "Supabase Realtime memberikan WebSocket-like feature tanpa setup manual."),
  genPrompt(9, "Learning Management System", "React + React Query", "Appwrite (Functions + Database)", "Appwrite Database", "VPS + Nginx + Certbot (SSL)", "Course creation, video lessons, quiz, progress tracking, certificate generation", "Appwrite Functions bisa dipakai untuk generate PDF certificate via Cloud Functions."),
  genPrompt(10, "Portfolio App Interaktif", "Astro + React", "PocketBase", "PocketBase SQLite + File Storage", "Cloudflare Pages (frontend) + VPS (backend)", "Projects showcase, case study, contact form, blog, dark/light mode, animations", "Astro menghasilkan static HTML untuk performa maksimal, PocketBase untuk form submission."),
  genPrompt(11, "Inventory Management", "React + Redux Toolkit", "Google Apps Script + Google Sheets", "Google Sheets (spreadsheet)", "Google Apps Script Web App (hosting)", "CRUD inventory, barcode scanning (input), stock alert, report export, multi-user access", "Seluruh aplikasi bisa berjalan tanpa biaya server — GAS gratis dan terintegrasi native dengan Google Sheets."),
  genPrompt(12, "Chat Application", "React + Socket.io client", "Node.js + Express + Socket.io", "MongoDB Atlas (NoSQL)", "VPS Ubuntu + PM2 + Nginx reverse proxy", "Real-time messaging, rooms/groups, typing indicator, read receipts, media upload", "Socket.io memberikan real-time bidirectional communication dengan fallback otomatis."),
  genPrompt(13, "Finance Tracker", "React + Chart.js", "Firebase (Auth + Firestore + Cloud Functions)", "Firestore NoSQL", "Firebase Hosting + Cloud Functions", "Budget planning, expense categories, recurring transactions, chart analytics, export Excel", "Cloud Functions bisa dipakai untuk otomatisasi reminder dan laporan bulanan."),
  genPrompt(14, "Restaurant Ordering System", "React PWA", "Supabase (Auth + PostgreSQL + Realtime)", "PostgreSQL via Supabase", "VPS + Docker Compose", "Menu digital, cart/checkout, order tracking, kitchen view, payment gateway", "PWA bisa di-install di HP tanpa app store — cocok untuk QR code ordering."),
  genPrompt(15, "API Management Tool", "React + Monaco Editor", "Appwrite Functions", "Appwrite Database", "VPS + Caddy (auto SSL)", "API testing, documentation auto-gen, rate limiting, team collaboration, request history", "Appwrite Functions (Deno runtime) cocok untuk lightweight API processing."),
  genPrompt(16, "Job Board Platform", "Next.js (SSR)", "Nhost (PostgreSQL + Hasura)", "PostgreSQL + Hasura GraphQL", "Vercel (frontend) + Nhost (backend)", "Post jobs, search/filter, applicant tracking, employer dashboard, email alerts", "SSR dari Next.js memberikan SEO yang kuat untuk listing job board."),
  genPrompt(17, "Wiki / Knowledge Base", "Astro + MDX", "PocketBase", "PocketBase SQLite + File Storage", "VPS minimal (1GB RAM)", "Article hierarchy, search, version history, comments, tags, export PDF", "MDX memungkinkan inline React component di halaman dokumentasi."),
  genPrompt(18, "Fitness Tracker", "React Native Web + Expo", "Firebase (Auth + Firestore)", "Firestore NoSQL", "Firebase Hosting + Expo EAS", "Exercise logging, workout plans, progress charts, timer, community feed", "React Native Web memungkinkan 1 codebase untuk web dan mobile."),
  genPrompt(19, "Real Estate Listing", "Next.js + Mapbox GL", "Supabase + PostGIS extension", "PostgreSQL + PostGIS", "VPS DigitalOcean / Hetzner", "Property listing, map search, filter by price/area, agent profile, inquiry form", "PostGIS memberikan geo-querying (radius search, bounding box) native di database."),
  genPrompt(20, "Event Management Platform", "React + React Calendar", "Appwrite (Auth + Database + Storage)", "Appwrite Database", "VPS + Nginx + Let's Encrypt", "Event creation, ticketing, attendee management, venue map, waitlist, analytics", "Appwrite Storage untuk upload poster event dan sertifikat kehadiran."),
  genPrompt(21, "Survey & Poll App", "React + Formik", "Google Apps Script + Google Sheets", "Google Sheets", "GAS Web App (hosting)", "Survey builder (drag-drop), multiple question types, real-time results chart, export data", "Hasil survey langsung tersimpan ke Google Sheets — bisa di-analisis tanpa export."),
  genPrompt(22, "CRM Mini", "React + AG Grid", "Supabase (Auth + RLS)", "PostgreSQL via Supabase", "VPS + Docker", "Lead pipeline, contact management, activity log, email template, deal tracking", "Row-Level Security (RLS) di Supabase memastikan data setiap user terisolasi di query level."),
  genPrompt(23, "File Sharing & Storage", "React +uppy upload", "Appwrite (Storage + Database)", "Appwrite Storage + Database", "VPS + Caddy", "Folder structure, drag-drop upload, shareable links, access control, versioning", "Appwrite Storage mendukung presigned URLs dan file metadata custom."),
  genPrompt(24, "Time Tracking App", "React + DND Kit", "Nhost (PostgreSQL)", "PostgreSQL", "Nhost Cloud atau self-host", "Timer start/stop, project assignment, timesheet, invoicing, team overview", "Hasura GraphQL membuat query agregasi (total hours per project) sangat efisien."),
  genPrompt(25, "Recipe & Meal Planner", "React + React Beautiful DND", "PocketBase", "PocketBase SQLite + File Storage", "VPS minimal atau Railway", "Recipe CRUD, ingredients list, meal scheduling, shopping list auto-gen, photo upload", "PocketBase sangat cepat untuk dataset kecil-menengah dan file attachment native."),
  genPrompt(26, "Community Forum", "Next.js", "Firebase (Firestore + Cloud Functions)", "Firestore NoSQL", "Firebase Hosting + Cloud Functions", "Threads, replies, upvote/downvote, user reputation, moderator tools, notifications", "Firestore subcollection cocok untuk struktur thread -> replies -> comments."),
  genPrompt(27, "Password Manager", "React + Web Crypto API", "Supabase (Auth + Storage encrypted)", "PostgreSQL (encrypted fields)", "VPS + Tailscale (secure network)", "Password generate/store, vault, autofill helper, security audit, 2FA", "Data di-encrypt client-side sebelum disimpan ke database — server tidak tahu isinya."),
  genPrompt(28, "Job Application Tracker", "React + Trello-like UI", "Appwrite", "Appwrite Database", "VPS + Docker Compose", "Application stages, company info, notes, salary negotiation, reminder follow-up", "Drag-drop UI memudahkan visualisasi pipeline aplikasi kerja."),
  genPrompt(29, "Expense Splitter", "React + QR Code generator", "Firebase (Auth + Firestore)", "Firestore NoSQL", "Firebase Hosting", "Create group, add expense, auto-split balance, QR payment code, settlement tracker", "Firestore transactions memastikan konsistensi data split balance."),
  genPrompt(30, "AI Chatbot Builder", "React + CodeMirror", "Google Apps Script + Dialogflow API", "Google Sheets (config)", "GAS Web App", "Chatbot flow builder, dialog export, embed code, analytics", "GAS bisa memanggil Dialogflow API gratis tier untuk NLP processing."),
  genPrompt(31, "Newsletter Platform", "Next.js + Resend", "Supabase (Auth + PostgreSQL)", "PostgreSQL", "Vercel + Supabase", "Audience management, email template builder, send schedule, open/click tracking, analytics", "Resend memberikan deliverability tinggi dan tracking event via webhook."),
  genPrompt(32, "Habit Tracker", "React + local storage sync", "PocketBase", "PocketBase SQLite", "VPS atau Render.com", "Habit CRUD, streak counter, calendar view, reminders, progress analytics", "Local storage sync untuk offline-first, sync ke PocketBase saat online."),
  genPrompt(33, "Whiteboard / Collaborative Drawing", "React + Canvas API + WebSocket", "Node.js + Socket.io + Appwrite Auth", "Appwrite Database (session state)", "VPS + Nginx", "Free draw, shapes, text, layers, real-time collaboration, save/load board", "WebSocket memberikan real-time sync antar user di board yang sama."),
  genPrompt(34, "Price Comparison Tool", "React + Puppeteer", "Supabase + Cron jobs", "PostgreSQL", "VPS + PM2 cron", "Web scraping products, price history chart, alert when price drops, affiliate links", "Puppeteer untuk scraping, Supabase menyimpan price history untuk chart."),
  genPrompt(35, "QR Code Business Card", "React + QR Generator", "Firebase (Auth + Firestore)", "Firestore NoSQL", "Firebase Hosting", "Profile card design, QR generate, link tracking, edit profile, scan analytics", "Firebase Hosting memberikan HTTPS otomatis dan CDN global."),
  genPrompt(36, "Code Snippet Manager", "React + Prism.js", "Appwrite", "Appwrite Database", "VPS + Caddy", "Snippet CRUD, language syntax highlight, tags, search, share/public links, import/export", "Appwrite Database flexible schema cocok untuk snippet dengan metadata variabel."),
  genPrompt(37, "Donation & Fundraising Platform", "Next.js + payment gateway", "Nhost (PostgreSQL + Hasura)", "PostgreSQL", "Nhost Cloud atau VPS", "Campaign creation, donation form, progress bar, donor wall, receipt generation, admin dashboard", "Hasura real-time subscription memberikan live donation counter tanpa polling."),
  genPrompt(38, "Markdown Note Taking App", "React + TipTap editor", "PocketBase", "PocketBase SQLite", "VPS atau Cloudflare Workers", "Rich markdown editing, folders, search, tags, export PDF/HTML, sync", "TipTap memberikan extensible editor yang bisa dikustomisasi plugin."),
  genPrompt(39, "Vehicle Fleet Tracker", "React + Leaflet map", "Supabase + PostGIS", "PostgreSQL + PostGIS", "VPS Docker Compose", "Vehicle registration, GPS tracking, fuel log, maintenance schedule, route history", "PostGIS spatial queries untuk mencari kendaraan terdekat atau dalam radius."),
  genPrompt(40, "URL Shortener + Analytics", "React + QR Code", "Firebase (Cloud Functions + Firestore)", "Firestore NoSQL", "Firebase Hosting + Cloud Functions", "URL shorten, custom alias, click analytics, geo/location data, QR code, API", "Cloud Functions menangani redirect dan logging — hosting statis untuk dashboard."),
  genPrompt(41, "Digital Signage / Menu Board", "React + fullscreen mode", "Google Apps Script + Google Sheets", "Google Sheets", "GAS Web App (fullscreen display)", "Content scheduling, remote update via spreadsheet, auto-refresh, multi-display support", "Perubahan di Google Sheets langsung ter-refleksi di tampilan signage tanpa restart."),
  genPrompt(42, "Personal Finance Dashboard", "Next.js + Recharts", "Appwrite Functions (Plaid API)", "Appwrite Database", "VPS", "Bank sync (Plaid), expense categorization, net worth tracker, budget goals, reports", "Appwrite Functions sebagai bridge aman ke Plaid API untuk data bank."),
  genPrompt(43, "Bug Tracker", "React + CodeMirror", "Nhost (Hasura + PostgreSQL)", "PostgreSQL", "Nhost Cloud", "Issue CRUD, severity/priority, assignee, status workflow, comments, code reference", "Hasura GraphQL subscriptions untuk real-time issue update antar team."),
  genPrompt(44, "Recipe Generator AI", "React + OpenAI API wrapper", "Supabase Edge Functions", "PostgreSQL", "Vercel + Supabase", "Ingredient-based recipe search, AI recipe generation, meal plan builder, nutritional info", "Edge Functions mendekatkan API call ke user dan menyimpan API key di server."),
  genPrompt(45, "Subscription Management", "React + Stripe Elements", "Firebase (Auth + Firestore + Functions)", "Firestore NoSQL", "Firebase Hosting + Cloud Functions", "Plan comparison, checkout, webhooks, billing history, usage limits, downgrade/upgrade", "Cloud Functions handling Stripe webhooks untuk lifecycle subscription."),
  genPrompt(46, "Document Scanner & OCR", "React + Tesseract.js", "Appwrite Storage + Functions", "Appwrite Storage + Database", "VPS + Nginx", "Upload photo, OCR extract text, edit output, save to DB, export PDF/CSV", "Tesseract.js melakukan OCR client-side tanpa server cost — Appwrite simpan hasil."),
  genPrompt(47, "Team Scheduling App", "React + FullCalendar", "PocketBase", "PocketBase SQLite", "VPS atau Railway", "Calendar view, availability sync, conflict detection, invite members, notification", "PocketBase realtime subscription untuk live calendar sync tanpa refresh."),
  genPrompt(48, "Auction / Bidding Platform", "React + countdown timer", "Supabase (Realtime + Auth)", "PostgreSQL via Supabase", "VPS Docker", "Auction listing, real-time bid updates, auto-increment bid, winner announcement, escrow", "Supabase Realtime memberikan live bid updates dengan latency < 100ms."),
  genPrompt(49, "SEO Analytics Dashboard", "Next.js + Google Analytics API", "Google Apps Script + Google Sheets", "Google Sheets + BigQuery export", "GAS Web App atau VPS", "Keyword tracking, backlink monitor, site audit score, competitor analysis, report PDF", "GAS bisa mengakses Google Analytics API untuk pull data SEO secara otomatis."),
  genPrompt(50, "Complete Admin Panel Generator", "React + dynamic form builder", "Supabase (Auth + PostgreSQL + Storage)", "PostgreSQL", "VPS atau self-host Docker", "CRUD generator, form builder, table management, export/import, user roles, API logs", "Generator bisa membaca schema tabel dan auto-generate CRUD interface dinamis."),
];

async function run() {
  // Ambil ID kategori "coding" langsung dari database (bukan hardcode)
  const [codingCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, "coding"))
    .limit(1);

  if (!codingCategory) {
    throw new Error(
      "Kategori dengan slug 'coding' tidak ditemukan di tabel categories. Jalankan schema seed dulu."
    );
  }

  CODING_CAT_ID = codingCategory.id;
  console.log(`Kategori "coding" ditemukan dengan id: ${CODING_CAT_ID}`);

  console.log(`Inserting ${appPrompts.length} fullstack app builder prompts...`);

  // Clear any existing prompts with app- prefix (idempotent)
  await db.execute(`DELETE FROM prompts WHERE slug LIKE 'app-%';`);

  let count = 0;
  for (const p of appPrompts) {
    await db.insert(prompts).values({ ...p, categoryId: CODING_CAT_ID });
    count++;
  }

  console.log(`✅ Inserted ${count} fullstack app builder prompts.`);
  console.log(`Total prompts now: ${count} new + 1070 existing = 1120`);

  pool.end();
}

run().catch(console.error);
