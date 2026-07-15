# 📘 QUICK START - SUPABASE DEPLOYMENT

Panduan cepat deploy ke Supabase. Untuk panduan lengkap (termasuk VPS/Vercel), lihat `INSTALL_GUIDE.md`.

---

## 🚀 QUICK SETUP (5 Menit)

### 1. Buat Project Supabase

1. Login ke [supabase.com](https://supabase.com/)
2. New Project → Isi nama & password
3. Region: **Southeast Asia (Singapore)**
4. Tunggu sampai status "Active"

### 2. Get Connection String

1. Settings → Database → Connection string → tab **URI**
2. Copy: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`
3. **Ganti** `[PASSWORD]` dengan password database Anda

### 3. Set Environment

Buat/edit file `.env`:

```bash
DATABASE_URL=postgresql://postgres:YourPassword@db.xxx.supabase.co:5432/postgres
ADMIN_PASSPHRASE=your-strong-passphrase
NODE_ENV=production
```

### 4. Run Schema di SQL Editor

1. Buka **SQL Editor** di Supabase dashboard
2. New Query
3. Buka file `supabase/schema.sql` → copy semua isi
4. Paste → **Run** (Ctrl+Enter)
5. Tunggu sampai selesai

### 5. Register Owner

1. New Query lagi di SQL Editor
2. Buka `supabase/register-owner.sql` → copy paste
3. **Run**
4. Owner `ucidesya@gmail.com` sekarang aktif dengan akses penuh

### 6. Install & Run

```bash
npm install
npx drizzle-kit push
npm run build
npm start
```

### 7. Seed Data

Buka di browser: `http://localhost:3000/api/admin/data/ensure`

Atau jalankan script:
```bash
npx tsx src/scripts/mass-seed.ts
npx tsx src/scripts/seed-fullstack-apps.ts
```

### 8. Login sebagai Owner

1. Buka `http://localhost:3000/admin`
2. Login dengan passphrase atau email `ucidesya@gmail.com`
3. Enjoy akses tanpa batas! 🎉

---

## 📋 FILE SQL YANG DISEDIAKAN

| File | Fungsi |
|------|--------|
| `supabase/schema.sql` | Schema lengkap (9 tabel + RLS + functions) |
| `supabase/register-owner.sql` | Register owner `ucidesya@gmail.com` |
| `supabase/admin-queries.sql` | Query admin (stats, analytics, maintenance) |

---

## 🔐 OWNER ACCESS

Email Anda `ucidesya@gmail.com` sudah terdaftar dengan:

- **Role**: `superadmin` (akses penuh ke admin panel)
- **Plan**: `enterprise` (akses semua fitur premium)
- **Status**: `active`
- **Copy Limit**: Unlimited (tidak terbatasi)
- **Troubleshooter**: Aktif
- **Admin Panel**: Full access

### Cara Login

**Option 1: Passphrase**
- Buka `/admin`
- Masukkan passphrase dari `ADMIN_PASSPHRASE` di `.env`

**Option 2: Email**
- Buka `/masuk`
- Login dengan `ucidesya@gmail.com`
- Masuk otomatis ke dashboard dengan akses penuh

---

## 📊 TABEL YANG DIBUAT

| Tabel | Deskripsi |
|-------|-----------|
| `categories` | 10 kategori prompt |
| `plans` | 4 paket membership |
| `profiles` | Data user/pelanggan |
| `orders` | Riwayat pesanan |
| `notifications` | Notifikasi user |
| `prompts` | Semua prompt (1120 total) |
| `reviews` | Ulasan user |
| `favorites` | Prompt favorit |
| `prompt_copies` | Tracking copy (limit user gratis) |

---

## 🎯 FITUR KEAMANAN

- ✅ Row Level Security (RLS) aktif
- ✅ Indexes untuk performa
- ✅ Foreign key constraints
- ✅ Check constraints (validasi data)
- ✅ Auto-update triggers
- ✅ Full-text search support
- ✅ Real-time subscription ready

---

## 📖 DOKUMENTASI LENGKAP

- `INSTALL_GUIDE.md` - Panduan lengkap (VPS, Vercel, Railway)
- `INSTALL_GUIDE.md#11-troubleshooting` - Troubleshooting
- `INSTALL_GUIDE.md#12-checklist-pre-production` - Checklist sebelum go-live

---

## ✅ VERIFIKASI

Test akses owner:
```bash
curl "http://localhost:3000/api/auth/access?email=ucidesya@gmail.com"
```

Expected:
```json
{
  "isPremium": true,
  "planSlug": "enterprise",
  "status": "active",
  "name": "Owner Start Digital",
  "email": "ucidesya@gmail.com"
}
```

Test copy unlimited:
```bash
curl -X POST http://localhost:3000/api/prompts/copy \
  -H 'Content-Type: application/json' \
  -d '{"promptId":73,"clientId":"owner-test","profileEmail":"ucidesya@gmail.com"}'
```

Expected:
```json
{
  "ok": true,
  "canCopy": true,
  "remaining": "unlimited",
  "isPremiumUser": true,
  "isAdmin": true
}
```

---

## 🆘 BANTUAN

Jika ada masalah:
1. Baca `INSTALL_GUIDE.md` (Troubleshooting section)
2. Jalankan query di `supabase/admin-queries.sql` untuk debug
3. Cek log error di terminal

---

**Selamat! Project Anda siap production. 🚀**
