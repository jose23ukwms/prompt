import { db, pool } from "../db/index";
import { prompts, categories } from "../db/schema";

const ROLES = [
  "Copywriter Senior", "Software Engineer", "Marketing Strategist", "Desainer UI/UX", 
  "Data Analyst", "SEO Specialist", "HR Manager", "Konsultan Bisnis", 
  "Sales Closer", "Product Manager", "Tutor Akademik", "Customer Success",
  "Penulis Konten", "Ahli Finansial", "Social Media Manager", "DevOps Engineer"
];

const ACTIONS = [
  "Buatkan", "Tuliskan", "Rancang", "Analisis", "Evaluasi", 
  "Ringkas", "Susun strategi", "Berikan ide untuk", "Optimasi", "Review dan perbaiki"
];

const TOPICS = [
  "kampanye peluncuran produk", "kode aplikasi React", "SOP operasional", 
  "email follow-up pelanggan", "naskah video pendek", "resume dan CV", 
  "artikel blog SEO", "landing page konversi tinggi", "pitch deck investor",
  "penanganan komplain", "skrip iklan persuasif", "struktur database",
  "desain dashboard admin", "rencana konten 30 hari", "panduan wawancara"
];

const PLATFORMS = [
  "Facebook Ads", "Next.js", "Instagram", "LinkedIn", "TikTok", 
  "Node.js", "Google Ads", "WordPress", "Midjourney", "WhatsApp"
];

const TONES = [
  "profesional dan tegas", "santai dan ramah", "edukatif dan informatif", 
  "persuasif dan emosional", "kreatif dan out-of-the-box", "analitis dan berbasis data"
];

const FORMATS = [
  "tabel terstruktur", "poin-poin (bullet points) ringkas", "paragraf naratif", 
  "skrip percakapan", "langkah demi langkah (step-by-step)", "kode siap pakai"
];

const FOLLOW_UPS = [
  "Buat 3 variasi alternatif dari hasil di atas dengan sudut pandang yang berbeda.",
  "Kritik hasil di atas secara jujur: apa kelemahannya, lalu perbaiki menjadi versi yang lebih kuat.",
  "Sesuaikan hasil agar lebih singkat untuk dibaca di mobile/layar kecil.",
  "Ubah nada bahasa menjadi lebih formal untuk ditujukan kepada pimpinan level C.",
  "Tambahkan 5 contoh kasus atau skenario dunia nyata untuk melengkapi data di atas.",
  "Jelaskan langkah pertama dari hasil di atas secara lebih mendetail dan praktis.",
  "Berikan tabel checklist (checklist evaluasi) untuk memastikan hasil di atas bisa diimplementasikan.",
  "Terjemahkan dan adaptasikan hasil di atas agar sesuai dengan kultur audiens internasional.",
  "Pangkas hasil di atas menjadi tweet/post singkat yang merangkum inti utamanya."
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

async function run() {
  console.log("Fetching categories...");
  const cats = await db.select().from(categories);
  if (cats.length === 0) throw new Error("Seed categories first!");

  console.log("Clearing existing prompts...");
  await db.execute(`TRUNCATE TABLE prompts CASCADE;`);

  const generateData = (isPremium: boolean, idx: number) => {
    const role = getRandom(ROLES);
    const action = getRandom(ACTIONS);
    const topic = getRandom(TOPICS);
    const platform = getRandom(PLATFORMS);
    const tone = getRandom(TONES);
    const format = getRandom(FORMATS);
    const cat = getRandom(cats);

    const title = `${action} ${topic} untuk ${platform} #${idx}`;
    const slug = slugify(title) + "-" + Math.random().toString(36).slice(-4);
    
    const content = `Bertindaklah sebagai seorang ${role} berpengalaman. Tugas Anda adalah ${action.toLowerCase()} ${topic} yang akan digunakan di platform ${platform}.\n\nPanduan gaya:\n- Nada bahasa: ${tone}\n- Format output yang diinginkan: ${format}\n- Fokuskan pada kejelasan dan dampak langsung.\n\nJika diperlukan informasi tambahan sebelum memulai, silakan ajukan pertanyaan terlebih dahulu.`;
    
    const usage = `Ubah detail spesifik seperti nama produk/perusahaan sebelum menjalankan prompt ini di AI Anda.`;
    const exampleOutput = `Berikut adalah draft awal untuk ${topic}:\n1. [Poin Utama]\n2. [Implementasi]\n...`;

    // Users and stats
    const usersCount = Math.floor(Math.random() * 5000) + 50;
    const copyCount = Math.floor(usersCount * (1.5 + Math.random()));
    const ratingCount = Math.floor(usersCount / 20) + 1;
    const ratingSum = Math.floor(ratingCount * (4.2 + Math.random() * 0.8));

    return {
      slug,
      title: title.slice(0, 100),
      description: `Prompt ini dirancang khusus untuk membantu Anda ${action.toLowerCase()} ${topic} dengan hasil yang berkualitas dan profesional.`,
      categoryId: cat.id,
      content,
      usage,
      exampleOutput,
      level: getRandom(["Pemula", "Menengah", "Lanjutan"]),
      language: "Indonesia",
      supportedAi: getRandomItems(["ChatGPT", "Claude", "Gemini", "DeepSeek", "Copilot"], 3),
      tags: [role.split(" ")[0].toLowerCase(), platform.toLowerCase(), "otomatisasi"],
      followUps: getRandomItems(FOLLOW_UPS, 3),
      isPremium,
      isTrending: Math.random() > 0.8,
      isBestSeller: Math.random() > 0.85,
      usersCount,
      copyCount,
      ratingSum,
      ratingCount,
      version: "1.0",
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random date in past
      updatedAt: new Date()
    };
  };

  const BATCH_SIZE = 100;
  
  console.log("Generating 70 Free Prompts...");
  const freePrompts = Array.from({ length: 70 }, (_, i) => generateData(false, i + 1));
  await db.insert(prompts).values(freePrompts);

  console.log("Generating 1130 Premium Prompts...");
  for (let i = 0; i < 1130; i += BATCH_SIZE) {
    const currentBatchSize = Math.min(BATCH_SIZE, 1130 - i);
    const premiumBatch = Array.from({ length: currentBatchSize }, (_, j) => generateData(true, i + j + 1));
    await db.insert(prompts).values(premiumBatch);
    console.log(`Inserted premium batch ${i + currentBatchSize} / 1130`);
  }

  console.log("Database seeded successfully with 1250 prompts!");
  pool.end();
}

run().catch(console.error);
