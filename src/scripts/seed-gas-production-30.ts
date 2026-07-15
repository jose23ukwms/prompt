import { db, pool } from "../db/index";
import { categories, prompts } from "../db/schema";
import { buildAutomatedFollowUps } from "../lib/prompt-audit";
import { eq, sql } from "drizzle-orm";

type AppSpec = {
  name: string;
  outcome: string;
  sheets: string[];
  requirements: string[];
  audience: string;
};

const SPECS: AppSpec[] = [
  { name: "Lead Routing & Follow-up", outcome: "mengumpulkan lead dari form, memberi skor, dan mengatur follow-up otomatis", sheets: ["Leads", "Sources", "FollowUps", "Users", "AuditLog"], requirements: ["lead scoring", "assignment round-robin", "reminder email", "status pipeline"], audience: "tim sales UMKM" },
  { name: "Purchase Request Approval", outcome: "mengelola permintaan pembelian dari pengajuan sampai approval bertingkat", sheets: ["Requests", "Items", "Approvers", "Users", "AuditLog"], requirements: ["approval threshold", "reject dengan alasan", "audit trail", "email notification"], audience: "perusahaan menengah" },
  { name: "Multi-Branch Sales Dashboard", outcome: "menggabungkan laporan penjualan dari banyak cabang ke dashboard manajemen", sheets: ["Branches", "Sales", "Products", "Targets", "Users"], requirements: ["filter cabang", "target vs actual", "date range", "CSV export"], audience: "owner retail" },
  { name: "Service Appointment Booking", outcome: "memungkinkan pelanggan memilih layanan, slot, dan menerima konfirmasi booking", sheets: ["Services", "Slots", "Bookings", "Customers", "Settings"], requirements: ["conflict prevention", "reschedule", "cancel policy", "reminder email"], audience: "salon atau klinik" },
  { name: "Quotation to Invoice Workflow", outcome: "mengubah quotation yang disetujui menjadi invoice dan melacak pembayaran", sheets: ["Quotations", "Invoices", "Clients", "LineItems", "Payments"], requirements: ["numbering atomik", "PDF export", "payment status", "overdue reminder"], audience: "freelancer dan agency" },
  { name: "Marketing Campaign Planner", outcome: "merencanakan campaign lintas channel dengan owner, budget, dan KPI", sheets: ["Campaigns", "Channels", "Tasks", "Budgets", "KPIs"], requirements: ["calendar view", "budget tracking", "approval", "KPI dashboard"], audience: "marketing team" },
  { name: "Customer Onboarding Portal", outcome: "mengumpulkan data onboarding pelanggan dan menampilkan progress checklist", sheets: ["Customers", "Checklists", "Documents", "Owners", "AuditLog"], requirements: ["secure token", "document checklist", "progress percent", "email reminder"], audience: "agency dan konsultan" },
  { name: "Warehouse Pick-Pack-Ship", outcome: "mengelola order gudang dari picking sampai pengiriman", sheets: ["Orders", "OrderItems", "Products", "PickLists", "Shipments"], requirements: ["stock reservation", "barcode-ready UI", "packing status", "shipping log"], audience: "operator gudang" },
  { name: "Subscription Renewal Tracker", outcome: "memantau kontrak berlangganan dan mengirim pengingat renewal", sheets: ["Subscriptions", "Customers", "Plans", "Renewals", "Notifications"], requirements: ["renewal forecast", "grace period", "reminder schedule", "revenue summary"], audience: "bisnis jasa berulang" },
  { name: "Quality Inspection Checklist", outcome: "mencatat inspeksi kualitas dengan bukti foto dan hasil pass/fail", sheets: ["Inspections", "Checklists", "Products", "Inspectors", "Evidence"], requirements: ["required fields", "pass/fail rules", "photo link", "inspection report"], audience: "operasional dan manufaktur ringan" },
  { name: "Customer Loyalty Points", outcome: "menghitung poin pelanggan, tier membership, dan penukaran reward", sheets: ["Customers", "Transactions", "PointRules", "Rewards", "Redemptions"], requirements: ["idempotent transaction", "balance ledger", "expiry", "redemption approval"], audience: "retail dan ecommerce" },
  { name: "Public Complaint Portal", outcome: "menerima keluhan publik dengan nomor tiket dan SLA transparan", sheets: ["Complaints", "Categories", "Assignments", "SLA", "Updates"], requirements: ["public ticket token", "PII minimization", "SLA escalation", "status page"], audience: "organisasi layanan publik" },
  { name: "School Enrollment Intake", outcome: "mengelola pendaftaran siswa, verifikasi berkas, dan status seleksi", sheets: ["Applicants", "Documents", "Programs", "Reviewers", "Decisions"], requirements: ["unique application code", "document checklist", "review rubric", "email status"], audience: "sekolah dan lembaga kursus" },
  { name: "Community Membership Portal", outcome: "mengelola anggota komunitas, iuran, event, dan kehadiran", sheets: ["Members", "Plans", "Payments", "Events", "Attendance"], requirements: ["membership status", "payment reconciliation", "event RSVP", "member search"], audience: "komunitas dan asosiasi" },
  { name: "RMA Return Management", outcome: "mengelola retur produk dari request sampai inspection dan replacement", sheets: ["Returns", "Orders", "Products", "Inspections", "Resolutions"], requirements: ["return reason", "eligibility rules", "status workflow", "resolution report"], audience: "toko online" },
  { name: "Recruitment Interview Pipeline", outcome: "mengatur kandidat, jadwal interview, scorecard, dan keputusan hiring", sheets: ["Candidates", "Jobs", "Interviews", "Scorecards", "Decisions"], requirements: ["interviewer access", "scorecard rubric", "calendar invite", "PII protection"], audience: "HR startup" },
  { name: "Procurement Vendor Scorecard", outcome: "menilai vendor berdasarkan delivery, kualitas, biaya, dan risiko", sheets: ["Vendors", "Purchases", "Deliveries", "Scores", "Contracts"], requirements: ["weighted scoring", "period comparison", "risk flags", "export report"], audience: "procurement team" },
  { name: "Internal IT Help Center", outcome: "menyediakan katalog layanan IT dan tracking tiket internal", sheets: ["Tickets", "Services", "Agents", "KnowledgeBase", "SLA"], requirements: ["service catalog", "auto assignment", "SLA timer", "knowledge suggestions"], audience: "tim IT internal" },
  { name: "Field Visit Report", outcome: "mencatat kunjungan lapangan, lokasi, temuan, dan tindak lanjut", sheets: ["Visits", "Clients", "Findings", "Actions", "Users"], requirements: ["mobile-first form", "timestamp", "map link", "photo evidence"], audience: "sales dan teknisi lapangan" },
  { name: "Donation Campaign Portal", outcome: "menampilkan campaign donasi, transaksi donor, dan laporan transparan", sheets: ["Campaigns", "Donors", "Donations", "Updates", "Reports"], requirements: ["donor receipt", "campaign progress", "anonymous option", "monthly report"], audience: "yayasan dan organisasi sosial" },
  { name: "Digital Product Delivery", outcome: "mengirim link produk digital setelah order diverifikasi", sheets: ["Products", "Orders", "Customers", "Deliveries", "AccessLog"], requirements: ["signed expiring link", "download tracking", "order verification", "resend email"], audience: "creator produk digital" },
  { name: "Freelance Timesheet & Billing", outcome: "mengubah timesheet freelancer menjadi billing dan laporan klien", sheets: ["Projects", "TimeLogs", "Clients", "Rates", "Invoices"], requirements: ["timer/manual log", "approval client", "billable rules", "invoice summary"], audience: "freelancer dan studio" },
  { name: "Restaurant Kitchen Display", outcome: "mengirim order ke antrian dapur berdasarkan status dan prioritas", sheets: ["Orders", "OrderItems", "Menu", "Stations", "Events"], requirements: ["kitchen queue", "priority flags", "prep timer", "daily report"], audience: "restoran kecil" },
  { name: "Property Viewing Scheduler", outcome: "mengatur permintaan kunjungan properti dan follow-up agen", sheets: ["Properties", "Leads", "Viewings", "Agents", "FollowUps"], requirements: ["slot locking", "agent assignment", "reminder", "lead conversion"], audience: "agen properti" },
  { name: "Insurance Claim Intake", outcome: "mengumpulkan klaim, bukti, pemeriksaan, dan keputusan", sheets: ["Claims", "Policies", "Customers", "Evidence", "Decisions"], requirements: ["claim number", "document validation", "review queue", "decision audit"], audience: "broker dan administrator" },
  { name: "Social Content Approval", outcome: "mengatur draft konten dari writer sampai approval publisher", sheets: ["Content", "Platforms", "Reviewers", "Calendar", "Revisions"], requirements: ["version history", "approval status", "publish schedule", "content checklist"], audience: "social media team" },
  { name: "Grant Application Review", outcome: "mengelola pengajuan grant dengan rubric penilaian dan ranking", sheets: ["Applications", "Applicants", "Criteria", "Reviews", "Decisions"], requirements: ["weighted rubric", "reviewer assignment", "conflict declaration", "ranking report"], audience: "program grant" },
  { name: "Clinic Queue Dashboard", outcome: "menampilkan antrian layanan klinik dengan nomor panggilan", sheets: ["Patients", "Queues", "Services", "Rooms", "Events"], requirements: ["queue number", "status transitions", "TV display", "daily metrics"], audience: "klinik dan layanan appointment" },
  { name: "Construction Daily Log", outcome: "mencatat progres proyek, pekerja, material, dan kendala harian", sheets: ["Projects", "DailyLogs", "Workers", "Materials", "Issues"], requirements: ["mobile input", "weather note", "progress percent", "photo evidence"], audience: "kontraktor dan site manager" },
  { name: "Business KPI Scorecard", outcome: "mengumpulkan KPI dari tim dan menghitung scorecard manajemen", sheets: ["KPIs", "Owners", "Targets", "Actuals", "Reviews"], requirements: ["period lock", "target vs actual", "owner reminder", "executive dashboard"], audience: "manajemen perusahaan" },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 170);
}

function buildContent(spec: AppSpec) {
  return `Bertindaklah sebagai Principal Software Engineer dan Google Apps Script architect. Bangun aplikasi production-grade "${spec.name}" dari nol sampai dapat digunakan melalui URL Google Apps Script Web App.

## Tujuan Bisnis
Aplikasi harus ${spec.outcome} untuk ${spec.audience}. Jangan membuat demo kosong. Semua alur harus punya data model, validasi, error state, dan acceptance criteria yang dapat diuji.

## Stack Non-Negotiable
- Frontend: HTML5, CSS modern, vanilla JavaScript modular, Bootstrap 5 atau Tailwind via CDN hanya untuk UI.
- Backend: Google Apps Script dengan doGet, doPost, service layer, validation layer, dan response JSON konsisten.
- Database: satu Google Spreadsheet sebagai database dengan tab: ${spec.sheets.map((s) => `"${s}"`).join(", ")}.
- Deployment: Google Apps Script Web App dengan Execute as: Me dan access policy yang dijelaskan secara aman.
- Config: Spreadsheet ID, allowed origin, email admin, dan feature flags di PropertiesService; tidak boleh hardcode secret.

## Fitur Wajib
${spec.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}
- CRUD lengkap dengan ID UUID, createdAt, updatedAt, createdBy, dan soft-delete bila relevan.
- Dashboard responsive dengan loading, empty, success, validation, unauthorized, quota, dan server-error state.
- Search, filter, sort, pagination, export CSV/PDF bila relevan, dan audit log perubahan penting.

## Aturan Engineering Google Sheets
- Gunakan header schema yang eksplisit dan fungsi ensureSheets/ensureHeaders yang idempotent.
- Gunakan LockService untuk semua operasi tulis yang berisiko race condition.
- Baca/tulis batch dengan getValues/setValues; hindari getRange di dalam loop.
- Validasi allowlist field, normalisasi tipe tanggal/angka, panjang string, dan sanitasi formula injection.
- Gunakan CacheService/PropertiesService secara tepat; pahami batas quota Apps Script dan berikan fallback.
- Jangan simpan password plaintext. Jelaskan opsi akses Google account/domain atau token berumur pendek.
- Jangan menaruh API key di HTML; secret hanya di Script Properties atau server-side service.

## Output yang Harus Diberikan AI
1. Architecture decision record dan flow data.
2. Struktur file: Code.gs, Config.gs, Auth.gs, Validation.gs, Repository.gs, Service.gs, Index.html, styles.html, app.html, serta test plan.
3. Kode lengkap setiap file, bukan pseudocode.
4. Header dan contoh row untuk setiap sheet.
5. Kontrak API: request, response sukses, validation error, unauthorized, quota error, dan server error.
6. Acceptance criteria yang bisa dicentang untuk setiap fitur.
7. Test cases untuk CRUD, concurrent write, invalid input, empty data, quota, akses publik, dan recovery.
8. Panduan deploy Web App, pengaturan access policy, Script Properties, versi deployment, rollback, dan monitoring.
9. Batasan skala Google Sheets serta rencana migrasi ke Supabase/PostgreSQL jika volume melebihi quota.

## Quality Gate
Sebelum final, lakukan self-review terhadap keamanan, validasi, race condition, performa, aksesibilitas, mobile layout, quota Apps Script, dan kesiapan deployment. Jika requirement ambigu, tulis asumsi dan pertanyaan klarifikasi terlebih dahulu. Output akhir harus profesional, konsisten, dapat diuji, dan siap dipelihara.`;
}

async function run() {
  const [coding] = await db.select().from(categories).where(eq(categories.slug, "coding")).limit(1);
  if (!coding) throw new Error("Kategori coding tidak ditemukan.");

  const existing = new Set(
    (await db.select({ slug: prompts.slug }).from(prompts).where(sql`${prompts.slug} like 'gas-pro-%'`)).map((row) => row.slug)
  );

  const rows = SPECS.map((spec, index) => {
    const slug = `gas-pro-${slugify(spec.name)}-${index + 1}`;
    return {
      slug,
      title: `Production GAS App: ${spec.name}`,
      description: `Blueprint production-grade untuk ${spec.name} memakai Google Apps Script sebagai backend, Google Sheets sebagai database, dan URL Web App publik.`,
      categoryId: coding.id,
      content: buildContent(spec),
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }).filter((row) => !existing.has(row.slug));

  if (rows.length > 0) await db.insert(prompts).values(rows);
  console.log(`✅ Inserted ${rows.length} production-grade GAS prompts (requested 30).`);
  pool.end();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
