import { db, pool } from "../db/index";
import { prompts } from "../db/schema";

const GAS_CAT_ID = 24; // Kategori "Coding"

const APP_IDEAS = [
  { name: "Inventory Management", desc: "Manajemen stok barang dengan barcode & laporan", sheets: ["Products", "StockIn", "StockOut", "Suppliers"] },
  { name: "Simple CRM", desc: "Customer Relationship Management untuk UMKM", sheets: ["Leads", "Contacts", "Deals", "Activities"] },
  { name: "Employee Attendance", desc: "Sistem absensi karyawan dengan GPS & foto", sheets: ["Employees", "Attendance", "LeaveRequests"] },
  { name: "Expense Tracker", desc: "Pelacakan pengeluaran tim dengan approval", sheets: ["Expenses", "Categories", "Approvals", "Users"] },
  { name: "Project Management Lite", desc: "Manajemen proyek sederhana dengan task & deadline", sheets: ["Projects", "Tasks", "TeamMembers", "Comments"] },
  { name: "Invoice Generator", desc: "Pembuatan invoice otomatis + tracking pembayaran", sheets: ["Invoices", "Clients", "Items", "Payments"] },
  { name: "Helpdesk Ticket System", desc: "Sistem tiket customer service", sheets: ["Tickets", "Customers", "Agents", "Responses"] },
  { name: "Event Registration", desc: "Pendaftaran event + QR code check-in", sheets: ["Events", "Registrations", "Attendees", "Checkins"] },
  { name: "Asset Management", desc: "Manajemen aset perusahaan (laptop, kendaraan, dll)", sheets: ["Assets", "Categories", "Assignments", "Maintenance"] },
  { name: "Simple HRIS", desc: "Human Resource Information System", sheets: ["Employees", "Departments", "Positions", "Payroll"] },
  { name: "Content Calendar", desc: "Kalender konten media sosial tim", sheets: ["Content", "Platforms", "Team", "Analytics"] },
  { name: "Vendor Management", desc: "Manajemen vendor & kontrak", sheets: ["Vendors", "Contracts", "Evaluations", "Documents"] },
  { name: "Meeting Room Booking", desc: "Sistem booking ruang meeting", sheets: ["Rooms", "Bookings", "Users", "Equipment"] },
  { name: "Customer Feedback", desc: "Pengumpulan & analisis feedback pelanggan", sheets: ["Feedback", "Surveys", "Responses", "Reports"] },
  { name: "Simple POS System", desc: "Point of Sale untuk toko kecil", sheets: ["Products", "Sales", "Customers", "Cashier"] },
  { name: "Document Approval Workflow", desc: "Workflow approval dokumen internal", sheets: ["Documents", "Approvals", "Users", "History"] },
  { name: "Training Management", desc: "Manajemen pelatihan karyawan", sheets: ["Trainings", "Participants", "Materials", "Certificates"] },
  { name: "Simple Accounting", desc: "Pembukuan sederhana (kas, bank, jurnal)", sheets: ["Transactions", "Accounts", "Categories", "Reports"] },
  { name: "Task Assignment Board", desc: "Papan tugas tim seperti Trello mini", sheets: ["Boards", "Tasks", "Members", "Comments"] },
  { name: "Visitor Management", desc: "Sistem manajemen tamu kantor", sheets: ["Visitors", "Hosts", "Checkins", "Badges"] },
  { name: "Knowledge Base", desc: "Basis pengetahuan internal perusahaan", sheets: ["Articles", "Categories", "Tags", "Authors"] },
  { name: "Simple E-commerce Backend", desc: "Backend untuk toko online sederhana", sheets: ["Products", "Orders", "Customers", "Inventory"] },
  { name: "Performance Review", desc: "Sistem penilaian kinerja karyawan", sheets: ["Reviews", "Employees", "Criteria", "Goals"] },
  { name: "Bug Tracking", desc: "Pelacakan bug & issue development", sheets: ["Issues", "Projects", "Assignees", "Comments"] },
  { name: "Resource Booking", desc: "Booking peralatan & resource kantor", sheets: ["Resources", "Bookings", "Users", "Categories"] },
  { name: "Simple Blog CMS", desc: "Content Management System untuk blog", sheets: ["Posts", "Categories", "Authors", "Comments"] },
  { name: "Lead Generation Form", desc: "Form capture lead + auto follow-up", sheets: ["Leads", "Sources", "Followups", "Status"] },
  { name: "IT Asset Request", desc: "Permintaan & approval aset IT", sheets: ["Requests", "Assets", "Users", "Approvals"] },
  { name: "Simple Membership System", desc: "Manajemen keanggotaan komunitas", sheets: ["Members", "Plans", "Payments", "Renewals"] },
  { name: "Daily Sales Report", desc: "Laporan penjualan harian otomatis", sheets: ["Sales", "Products", "Staff", "Reports"] },
  { name: "Complaint Management", desc: "Manajemen keluhan pelanggan", sheets: ["Complaints", "Customers", "Resolutions", "SLA"] },
  { name: "Simple Wiki", desc: "Wiki internal untuk dokumentasi tim", sheets: ["Pages", "Categories", "Revisions", "Authors"] },
  { name: "Vehicle Fleet Management", desc: "Manajemen armada kendaraan", sheets: ["Vehicles", "Drivers", "Trips", "Maintenance"] },
  { name: "Simple Survey Tool", desc: "Pembuatan & distribusi survei", sheets: ["Surveys", "Questions", "Responses", "Reports"] },
  { name: "Onboarding Checklist", desc: "Checklist onboarding karyawan baru", sheets: ["Employees", "Checklists", "Tasks", "Progress"] },
  { name: "Simple Donation Tracker", desc: "Pelacakan donasi & donor", sheets: ["Donors", "Donations", "Campaigns", "Reports"] },
  { name: "Equipment Maintenance Log", desc: "Catatan perawatan peralatan", sheets: ["Equipment", "Maintenance", "Technicians", "History"] },
  { name: "Simple Newsletter Manager", desc: "Manajemen subscriber newsletter", sheets: ["Subscribers", "Campaigns", "Opens", "Clicks"] },
  { name: "Task Time Tracker", desc: "Pelacakan waktu pengerjaan tugas", sheets: ["Tasks", "TimeLogs", "Users", "Projects"] },
  { name: "Simple Quotation System", desc: "Pembuatan & tracking quotation", sheets: ["Quotations", "Clients", "Items", "Revisions"] },
  { name: "Internal Job Posting", desc: "Lowongan kerja internal perusahaan", sheets: ["Jobs", "Applicants", "Stages", "Notes"] },
  { name: "Simple File Request System", desc: "Permintaan & approval file dokumen", sheets: ["Requests", "Files", "Approvers", "History"] },
  { name: "Event Volunteer Management", desc: "Manajemen relawan event", sheets: ["Events", "Volunteers", "Shifts", "Checkins"] },
  { name: "Simple Audit Log", desc: "Catatan aktivitas sistem", sheets: ["Logs", "Users", "Actions", "Entities"] },
  { name: "Product Catalog Manager", desc: "Manajemen katalog produk digital", sheets: ["Products", "Categories", "Variants", "Media"] },
  { name: "Simple Referral Program", desc: "Program referral & reward", sheets: ["Referrers", "Referrals", "Rewards", "Payouts"] },
  { name: "Training Attendance", desc: "Absensi pelatihan karyawan", sheets: ["Trainings", "Participants", "Attendance", "Certificates"] },
  { name: "Simple SLA Tracker", desc: "Pelacakan Service Level Agreement", sheets: ["Tickets", "SLAs", "Escalations", "Reports"] },
  { name: "Internal Marketplace", desc: "Marketplace internal antar divisi", sheets: ["Items", "Sellers", "Buyers", "Transactions"] },
  { name: "Simple Compliance Tracker", desc: "Pelacakan kepatuhan regulasi", sheets: ["Requirements", "Compliance", "Evidence", "Audits"] },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 180);
}

function buildGASPrompt(idea: any, index: number) {
  const slug = `gas-${slugify(idea.name)}-${index}`;
  const title = `Buat Aplikasi ${idea.name} dengan Google Apps Script + Google Sheets`;

  const content = `Buat aplikasi web lengkap **${idea.name}** menggunakan **Google Apps Script sebagai backend** dan **Google Sheets sebagai database**.

## Teknologi yang WAJIB digunakan:
- **Frontend**: HTML + CSS + JavaScript (bisa pakai Bootstrap 5 atau Tailwind via CDN)
- **Backend**: Google Apps Script (doGet, doPost, spreadsheet operations)
- **Database**: Google Sheets dengan struktur tabel yang efisien
- **Deployment**: Web App via Google Apps Script (URL publik)

## Fitur yang harus ada:
1. **CRUD Lengkap** untuk semua entitas utama
2. **Autentikasi sederhana** (email + password atau Google Sign-In via GAS)
3. **Dashboard** dengan ringkasan data
4. **Form input** yang user-friendly
5. **Tabel data** dengan fitur search, filter, dan pagination
6. **Export ke Excel/PDF**
7. **Validasi data** di frontend & backend

## Struktur Google Sheets yang direkomendasikan:
${idea.sheets.map((sheet: string, i: number) => `- Sheet "${sheet}"`).join("\n")}

## Struktur Kode yang diharapkan:
1. \`Code.gs\` - Backend logic (doGet, doPost, CRUD functions)
2. \`Index.html\` - Frontend utama (HTML + CSS + JS)
3. \`Utils.gs\` - Helper functions
4. \`Auth.gs\` - Autentikasi & otorisasi

## Instruksi Output:
Berikan kode **lengkap** untuk setiap file, bukan pseudocode. Sertakan:
- Penjelasan cara membuat Google Sheet baru
- Cara menghubungkan script dengan spreadsheet
- Cara deploy sebagai Web App
- Cara mendapatkan URL Web App
- Contoh data awal untuk setiap sheet

Pastikan aplikasi bisa langsung digunakan setelah di-deploy.`;

  const usage = `1. Buat Google Sheet baru sesuai struktur yang diberikan
2. Buat project Google Apps Script baru
3. Copy-paste semua kode yang diberikan
4. Hubungkan script dengan spreadsheet ID
5. Deploy sebagai Web App (Execute as: Me, Who has access: Anyone)
6. Buka URL yang diberikan`;

  const example = `Aplikasi ${idea.name} siap digunakan:
- URL Web App: https://script.google.com/macros/s/...
- Fitur: CRUD, Dashboard, Export, Search
- Database: Google Sheets (real-time sync)`;

  return {
    slug,
    title: title.slice(0, 240),
    description: `Aplikasi ${idea.name} lengkap menggunakan Google Apps Script sebagai backend dan Google Sheets sebagai database. Bisa langsung diakses via URL Web App.`,
    categoryId: GAS_CAT_ID,
    content,
    usage,
    exampleOutput: example,
    level: "Menengah",
    language: "Indonesia",
    supportedAi: ["ChatGPT", "Claude", "Gemini", "DeepSeek"],
    tags: ["google-apps-script", "google-sheets", "web-app", "no-code", "backend", "database", "deploy", "gas"],
    followUps: [
      "Tambahkan fitur export PDF dan kirim email otomatis.",
      "Buat sistem autentikasi yang lebih aman dengan session & role.",
      "Optimasi performa untuk data yang sangat besar (ribuan baris).",
    ],
    isPremium: true,
    isTrending: index <= 10,
    isBestSeller: index <= 5,
    usersCount: 300 + index * 7,
    copyCount: 500 + index * 9,
    ratingSum: 92,
    ratingCount: 19,
    version: "1.0",
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 20)),
    updatedAt: new Date(),
  };
}

async function run() {
  console.log("Generating 50 Google Apps Script + Google Sheets prompts...");

  const gasPrompts = APP_IDEAS.map((idea, i) => buildGASPrompt(idea, i + 1));

  // Hapus prompt lama dengan prefix gas-
  await db.execute(`DELETE FROM prompts WHERE slug LIKE 'gas-%';`);

  await db.insert(prompts).values(gasPrompts);

  console.log(`✅ Inserted ${gasPrompts.length} Google Apps Script + Google Sheets prompts.`);
  pool.end();
}

run().catch(console.error);
