import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Untuk deploy ke static hosting (Hostinger hPanel, Netlify, etc.)
  // Hapus komentar baris di bawah ini jika ingin static export.
  // CATATAN: Static export tidak mendukung API routes dan dynamic server rendering.
  // Untuk fitur full (API, database, auth), deploy ke Vercel/Railway/VPS.
  // output: "export",
  // distDir: "dist",
  // images: { unoptimized: true },

  // Konfigurasi untuk production
  poweredByHeader: false,
  
  // Redirects
  async redirects() {
    return [
      {
        source: "/admin/super",
        destination: "/admin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
