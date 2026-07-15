export type AuditablePrompt = {
  slug: string;
  title: string;
  description: string;
  content: string;
  usage: string;
  exampleOutput: string;
  tags: string[];
  followUps: string[];
  supportedAi?: string[];
  categoryName?: string;
  isPremium?: boolean;
};

export type PromptAudit = {
  slug: string;
  score: number;
  passed: boolean;
  errors: string[];
  warnings: string[];
};

const QUALITY_MARKERS = [
  "acceptance criteria",
  "output format",
  "validasi",
  "error handling",
  "production",
];

export const AUTOMATED_FOLLOW_UPS = [
  "QUALITY GATE — Tinjau hasil sebelumnya dengan rubrik yang terukur: tujuan, kelengkapan, akurasi, format, edge case, dan kesiapan dipakai. Buat daftar gap sebelum memperbaiki apa pun.",
  "IMPLEMENTATION PASS — Perbaiki seluruh gap dari quality gate. Jangan mengarang data; jika konteks kurang, ajukan maksimal 3 pertanyaan klarifikasi lalu berikan asumsi yang eksplisit.",
  "HARDENING PASS — Audit hasil terhadap validasi input, error handling, keamanan, performa, aksesibilitas, dan edge case. Tampilkan perubahan sebelum/sesudah serta alasan teknisnya.",
  "RELEASE PASS — Buat checklist acceptance criteria, test case utama, rollback/backup plan, dan langkah deployment atau handover agar hasil siap digunakan di lingkungan production.",
];

export function auditPrompt(prompt: AuditablePrompt): PromptAudit {
  const errors: string[] = [];
  const warnings: string[] = [];
  const content = prompt.content.toLowerCase();
  const category = (prompt.categoryName || "").toLowerCase();

  if (!prompt.title || prompt.title.trim().length < 12) {
    errors.push("Judul terlalu pendek atau belum spesifik.");
  }
  if (!prompt.description || prompt.description.trim().length < 45) {
    errors.push("Deskripsi belum menjelaskan outcome yang dihasilkan.");
  }
  if (!prompt.content || prompt.content.trim().length < 350) {
    errors.push("Instruksi prompt terlalu pendek untuk output production-grade.");
  }
  if (!prompt.usage || prompt.usage.trim().length < 35) {
    warnings.push("Cara penggunaan belum cukup detail.");
  }
  if (!prompt.exampleOutput || prompt.exampleOutput.trim().length < 35) {
    warnings.push("Contoh output belum cukup konkret.");
  }
  if (!prompt.tags || prompt.tags.length < 3) {
    warnings.push("Tag kurang dari 3.");
  }
  if (!prompt.followUps || prompt.followUps.length < 4) {
    warnings.push("Workflow prompt lanjutan belum mencapai 4 tahap otomatis.");
  }
  if (prompt.supportedAi && prompt.supportedAi.length < 2) {
    warnings.push("Model AI yang didukung kurang dari 2.");
  }

  const missingMarkers = QUALITY_MARKERS.filter((marker) => !content.includes(marker));
  if (missingMarkers.length >= 3) {
    warnings.push(`Quality marker belum lengkap: ${missingMarkers.join(", ")}.`);
  }
  if (category.includes("coding") && !/(security|keamanan)/i.test(content)) {
    warnings.push("Prompt coding belum menyebutkan security review.");
  }
  if ((category.includes("coding") || category.includes("automation")) && !/(deploy|deployment|hosting)/i.test(content)) {
    warnings.push("Prompt teknis belum menyebutkan deployment/hosting.");
  }

  const deductions = errors.length * 20 + warnings.length * 7;
  const score = Math.max(0, Math.min(100, 100 - deductions));
  return {
    slug: prompt.slug,
    score,
    passed: errors.length === 0 && score >= 75,
    errors,
    warnings,
  };
}

export function buildQualityAppendix(categoryName = "umum") {
  return `

## PRODUCTION QUALITY GATE — WAJIB DIIKUTI
Sebelum memberi jawaban final, lakukan pemeriksaan berikut untuk kategori ${categoryName}:
1. Nyatakan asumsi, input yang masih kurang, dan acceptance criteria yang dapat diverifikasi.
2. Berikan output dalam format yang konsisten, lengkap, dan langsung dapat dipakai; jangan gunakan pseudocode jika pengguna meminta implementasi.
3. Tambahkan validasi input, error handling, edge case, keamanan, performa, aksesibilitas, deployment/hosting, dan rollback/backup plan yang relevan.
4. Jangan mengarang fakta, API key, URL, data pelanggan, atau konfigurasi rahasia. Gunakan placeholder environment variable.
5. Akhiri dengan quality check: checklist requirement yang terpenuhi, test case utama, risiko yang tersisa, dan langkah berikutnya.
`;
}

export function buildAutomatedFollowUps(existing: string[], title: string, categoryName: string) {
  const contextual = [
    `CONTEXT PASS — Pecah kebutuhan untuk "${title}" menjadi tujuan, aktor, input, output, batasan, dan acceptance criteria. Jika ada konflik requirement, tandai sebelum melanjutkan.`,
    ...existing,
    ...AUTOMATED_FOLLOW_UPS,
  ];
  const unique = [...new Set(contextual.map((item) => item.trim()).filter(Boolean))];
  // Selalu sediakan workflow minimum 4 langkah; maksimal 7 agar panel tetap nyaman.
  const result = unique.slice(0, 7);
  if (result.length < 4) {
    result.push(...AUTOMATED_FOLLOW_UPS.slice(0, 4 - result.length));
  }
  return result.slice(0, 7);
}
