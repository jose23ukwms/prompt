// ⚠️ KONFIGURASI INI HANYA UNTUK STATIC EXPORT
// Static export TIDAK mendukung: API routes, database, auth, dynamic rendering
// Gunakan ini HANYA jika Anda ingin deploy ke shared hosting tanpa Node.js
// Untuk fitur full, deploy ke Vercel/Railway/VPS

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
