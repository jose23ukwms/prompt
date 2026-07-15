# 📘 PANDUAN INSTALL & DEPLOYMENT LENGKAP
# Start Digital - AI Prompt Premium
# ========================================

Dokumen ini berisi panduan SUPER LENGKAP dari awal (prasyarat) sampai production-ready, 
termasuk konfigurasi Supabase dengan SQL Editor untuk setup database.

---

## 📋 DAFTAR ISI

1. [Prasyarat](#1-prasyarat)
2. [Install Lokal (Development)](#2-install-lokal-development)
3. [Setup Supabase (Database)](#3-setup-supabase-database)
4. [Konfigurasi Environment](#4-konfigurasi-environment)
5. [SQL Editor - Schema & Seed](#5-sql-editor---schema--seed)
6. [Verifikasi Database](#6-verifikasi-database)
7. [Deploy ke VPS](#7-deploy-ke-vps)
8. [Deploy ke Vercel](#8-deploy-ke-vercel)
9. [Deploy ke Railway](#9-deploy-ke-railway)
10. [Akses Owner Panel](#10-akses-owner-panel)
11. [Troubleshooting](#11-troubleshooting)
12. [Checklist Pre-Production](#12-checklist-pre-production)

---

## 1. PRASYARAT

### Software yang Harus Diinstall

**Wajib:**
- [ ] Node.js versi 18+ (rekomendasi: 20 LTS) - [Download](https://nodejs.org/)
- [ ] Git - [Download](https://git-scm.com/)
- [ ] npm atau pnpm (biasanya sudah ikut Node.js)
- [ ] Code Editor (VS Code direkomendasikan)
- [ ] Terminal (Command Prompt / PowerShell / Bash)

**Opsional:**
- [ ] Docker (untuk deployment)
- [ ] PostgreSQL lokal (untuk development tanpa Supabase)
- [ ] Postman/Insomnia (untuk test API)

### Akun yang Dibutuhkan

- [ ] **Supabase Account** - [Buat di sini](https://supabase.com/) (GRATIS)
- [ ] **GitHub Account** - [Buat di sini](https://github.com/)
- [ ] **Vercel Account** (untuk deploy) - [Buat di sini](https://vercel.com/)
- [ ] **VPS** (DigitalOcean/Hetzner) - opsional

### Verifikasi Versi

Buka terminal dan jalankan:
```bash
node --version      # Harus >= 18
npm --version       # Harus >= 9
git --version       # Harus ada
```

---

## 2. INSTALL LOKAL (DEVELOPMENT)

### Langkah 1: Clone Repository

```bash
git clone https://github.com/USERNAME/REPO-NAME.git
cd REPO-NAME
```

### Langkah 2: Install Dependencies

```bash
npm install
# atau
pnpm install
```

Tunggu sampai selesai (biasanya 1-3 menit).

### Langkah 3: Setup File Environment

```bash
cp .env.example .env
```

Jika tidak ada `.env.example`, buat file `.env` baru dengan isi minimal:

```bash
# Database (akan diisi setelah setup Supabase)
DATABASE_URL=

# Passphrase untuk login admin (ubah dengan passphrase kuat Anda)
ADMIN_PASSPHRASE=passphrase-rahasia-anda
```

### Langkah 4: Jalankan Development Server

```bash
npm run dev
```

Buka browser: `http://localhost:3000`

> **Catatan:** Aplikasi akan error jika database belum di-setup. Lanjut ke bagian 3.

---

## 3. SETUP SUPABASE (DATABASE)

### Langkah 1: Buat Akun Supabase

1. Buka [https://supabase.com/](https://supabase.com/)
2. Klik **"Start your project"**
3. Login dengan GitHub / Google / Email
4. Verifikasi email jika diperlukan

### Langkah 2: Buat Project Baru

1. Klik **"New Project"**
2. Isi form:
   - **Name**: `start-digital` (atau nama Anda)
   - **Database Password**: [buat password kuat, SIMPAN! ]
   - **Region**: `Southeast Asia (Singapore)` untuk latency rendah ke Indonesia
   - **Pricing Plan**: Free (cukup untuk development)
3. Klik **"Create new project"**
4. Tunggu 1-2 menit sampai project ready

### Langkah 3: Dapatkan Connection String

1. Di dashboard Supabase, klik menu **"Settings"** (ikon gear) di sidebar kiri
2. Pilih **"Database"**
3. Scroll ke bagian **"Connection string"**
4. Klik tab **"URI"**
5. Copy connection string yang formatnya:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
6. **Ganti** `[YOUR-PASSWORD]` dengan password database yang Anda buat tadi
7. Simpan string ini di tempat aman

### Langkah 4: Aktifkan Fitur Penting

Di menu **Database → Extensions**, pastikan aktif:
- [x] `uuid-ossp`
- [x] `pgcrypto`

Di menu **Database → Functions**, aktifkan:
- [x] `pg_trgm` (untuk text search)

Di menu **Authentication → URL Configuration**, set:
- Site URL: `http://localhost:3000` (untuk dev)
- Redirect URLs: `http://localhost:3000/**`

---

## 4. KONFIGURASI ENVIRONMENT

### Update File `.env`

Buka file `.env` dan update:

```bash
# Database - paste dari Supabase
DATABASE_URL=postgresql://postgres:YourPasswordHere@db.xxxxx.supabase.co:5432/postgres

# Admin passphrase (untuk akses Control Panel)
ADMIN_PASSPHRASE=ganti-dengan-passphrase-kuat-123

# Node environment
NODE_ENV=development
```

### Verifikasi Koneksi Database

Jalankan dari terminal:

```bash
npx drizzle-kit push
```

Jika berhasil, akan muncul:
```
✓ Pulling schema from database...
✓ Changes applied
```

Jika error:
- Cek `DATABASE_URL` (password, project ref)
- Cek koneksi internet
- Cek apakah Supabase project sudah ready (status "Active")

---

## 5. SQL EDITOR - SCHEMA & SEED

### Langkah 1: Buka SQL Editor di Supabase

1. Di dashboard Supabase, klik menu **"SQL Editor"** di sidebar kiri
2. Klik **"New query"**

### Langkah 2: Jalankan Schema

1. Buka file `supabase/schema.sql` di project Anda
2. Copy **seluruh isi** file tersebut
3. Paste ke SQL Editor Supabase
4. Klik tombol **"Run"** (atau tekan `Ctrl+Enter`)
5. Tunggu sampai selesai (biasanya 5-30 detik)
6. Lihat output di bagian bawah:
   ```
   Schema berhasil dibuat!
   total_categories: 10
   total_plans: 4
   ```

### Langkah 3: Register Owner

1. Klik **"New query"** lagi
2. Buka file `supabase/register-owner.sql`
3. Copy dan paste ke SQL Editor
4. Klik **"Run"**
5. Verifikasi output:
   ```
   id | email              | name                  | role       | plan_slug  | status
   ---+--------------------+-----------------------+------------+------------+--------
    1 | ucidesya@gmail.com | Owner Start Digital   | superadmin | enterprise | active
   ```

### Langkah 4: Seed Data (Opsional tapi Recommended)

Seed data dilakukan melalui aplikasi (bukan SQL) karena ada 1000+ prompt.

Jalankan dari terminal:

```bash
# Pastikan DATABASE_URL sudah benar di .env
npm run build
npm start
```

Lalu buka browser dan kunjungi endpoint ini untuk seed otomatis:

```
http://localhost:3000/api/admin/data/ensure
```

Atau gunakan script mass-seed (lebih cepat):

```bash
npx tsx src/scripts/mass-seed.ts
npx tsx src/scripts/seed-fullstack-apps.ts
```

### Langkah 5: Verifikasi Data

Di SQL Editor, jalankan query dari `supabase/admin-queries.sql`:

```sql
-- Cek total prompts
SELECT 
  COUNT(*) AS total_prompts,
  COUNT(*) FILTER (WHERE is_premium = false) AS free_prompts,
  COUNT(*) FILTER (WHERE is_premium = true) AS premium_prompts
FROM prompts;
```

Hasil yang diharapkan:
```
total_prompts: 1120
free_prompts: 70
premium_prompts: 1050
```

---

## 6. VERIFIKASI DATABASE

### Check dari Terminal

```bash
# Test API health
curl http://localhost:3000/api/health

# Test owner access
curl "http://localhost:3000/api/auth/access?email=ucidesya@gmail.com"
```

Response yang diharapkan:
```json
{
  "isPremium": true,
  "planSlug": "enterprise",
  "status": "active",
  "name": "Owner Start Digital",
  "email": "ucidesya@gmail.com"
}
```

### Check dari SQL Editor

Jalankan query:
```sql
SELECT * FROM profiles WHERE email = 'ucidesya@gmail.com';
```

### Check dari Browser

1. Buka `http://localhost:3000`
2. Klik **"Masuk"**
3. Login dengan `ucidesya@gmail.com`
4. Anda akan masuk sebagai **Owner dengan akses tanpa batas**

---

## 7. DEPLOY KE VPS

### Prasyarat VPS

- [ ] Ubuntu 22.04 LTS (direkomendasikan)
- [ ] Minimal 2GB RAM, 2 vCPU, 40GB SSD
- [ ] Domain yang sudah pointing ke IP VPS
- [ ] SSH access

### Langkah 1: Setup Server

SSH ke VPS:
```bash
ssh root@IP_VPS_ANDA
```

Update sistem:
```bash
apt update && apt upgrade -y
```

Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Install PM2 (process manager):
```bash
npm install -g pm2
```

Install Nginx:
```bash
apt install -y nginx
```

Install Certbot (SSL):
```bash
apt install -y certbot python3-certbot-nginx
```

### Langkah 2: Clone Project

```bash
cd /var/www
git clone https://github.com/USERNAME/REPO-NAME.git start-digital
cd start-digital
```

### Langkah 3: Install & Build

```bash
npm install
npm run build
```

### Langkah 4: Setup Environment

```bash
nano .env
```

Isi dengan:
```bash
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
ADMIN_PASSPHRASE=passphrase-produksi-kuat
NODE_ENV=production
PORT=3000
```

### Langkah 5: Jalankan dengan PM2

```bash
pm2 start npm --name "start-digital" -- start
pm2 save
pm2 startup
```

### Langkah 6: Setup Nginx

Buat config file:
```bash
nano /etc/nginx/sites-available/start-digital
```

Isi dengan:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan:
```bash
ln -s /etc/nginx/sites-available/start-digital /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Langkah 7: Setup SSL (HTTPS)

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Ikuti instruksi dan pilih **redirect HTTP to HTTPS**.

### Langkah 8: Verifikasi

Buka `https://yourdomain.com` di browser. Selesai! 🎉

---

## 8. DEPLOY KE VERCEL

### Langkah 1: Push ke GitHub

```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Langkah 2: Import ke Vercel

1. Buka [https://vercel.com/new](https://vercel.com/new)
2. Import repository GitHub Anda
3. Pilih framework preset: **Next.js**
4. Klik **"Deploy"**

### Langkah 3: Set Environment Variables

Di Settings → Environment Variables, tambahkan:
- `DATABASE_URL`: (dari Supabase)
- `ADMIN_PASSPHRASE`: (passphrase produksi)
- `NODE_ENV`: `production`

### Langkah 4: Re-deploy

Setelah set environment, redeploy dari dashboard Vercel.

### Langkah 5: Custom Domain

1. Settings → Domains
2. Tambahkan domain Anda
3. Update DNS record sesuai instruksi Vercel
4. Tunggu propagasi DNS (biasanya 5-60 menit)

---

## 9. DEPLOY KE RAILWAY

### Langkah 1: Push ke GitHub

```bash
git push origin main
```

### Langkah 2: Import ke Railway

1. Buka [https://railway.app/](https://railway.app/)
2. Login dengan GitHub
3. Klik **"New Project"** → **"Deploy from GitHub repo"**
4. Pilih repository Anda

### Langkah 3: Set Variables

Di tab **"Variables"**, tambahkan:
- `DATABASE_URL`
- `ADMIN_PASSPHRASE`
- `NODE_ENV=production`

### Langkah 4: Deploy

Railway akan otomatis build dan deploy. Tunggu 2-5 menit.

### Langkah 5: Generate Domain

Di tab **"Settings"** → **"Networking"** → **"Generate Domain"**

---

## 10. AKSES OWNER PANEL

### Login sebagai Owner

1. Buka website Anda
2. Akses URL: `https://yourdomain.com/admin`
3. Masukkan passphrase yang Anda set di `ADMIN_PASSPHRASE`
4. **Atau** login dengan email `ucidesya@gmail.com` via `/masuk`

### Akses Menu

Setelah login, Anda akan melihat **Control Panel** dengan menu:

- **📊 Ringkasan** - Dashboard statistik
- **📦 Prompt** - Kelola prompt (CRUD)
- **🧾 Pesanan** - Approve/reject order
- **👥 Pelanggan** - Manajemen user
- **🗄️ Data** - Sync data & backup

### Fitur Owner

- ✅ Copy prompt tanpa batas
- ✅ Prompt Troubleshooter aktif
- ✅ Approve/reject pesanan
- ✅ CRUD prompt
- ✅ Kelola user
- ✅ Lihat semua data
- ✅ Export backup

---

## 11. TROUBLESHOOTING

### Masalah: Cannot connect to database

**Solusi:**
1. Cek `DATABASE_URL` format benar
2. Cek password database benar
3. Cek Supabase project status "Active"
4. Cek firewall/network di Supabase

### Masalah: npm install error

**Solusi:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Masalah: Build error

**Solusi:**
```bash
npm run build
# Baca error message
# Biasanya: TypeScript error atau import yang salah
```

### Masalah: Migration error

**Solusi:**
```bash
# Reset schema (hati-hati: data akan hilang!)
# Jalankan ulang schema.sql di Supabase SQL Editor

# Atau gunakan Drizzle
npx drizzle-kit drop
npx drizzle-kit push
```

### Masalah: Owner tidak bisa login

**Solusi:**
1. Jalankan `register-owner.sql` di SQL Editor
2. Cek `ADMIN_PASSPHRASE` di `.env`
3. Clear browser cache/cookies

### Masalah: 500 Error di halaman prompt

**Solusi:**
1. Cek apakah database sudah ada data
2. Jalankan `/api/admin/data/ensure` di browser
3. Cek console browser untuk error detail

---

## 12. CHECKLIST PRE-PRODUCTION

Sebelum deploy ke production, pastikan:

### Database
- [ ] Supabase project active
- [ ] Schema.sql sudah dijalankan
- [ ] Register-owner.sql sudah dijalankan
- [ ] Data seed sudah dilakukan (1120 prompts)
- [ ] Backup database sudah dibuat

### Environment
- [ ] `DATABASE_URL` production sudah diset
- [ ] `ADMIN_PASSPHRASE` production sudah kuat
- [ ] `NODE_ENV=production`
- [ ] Semua secrets di-set (jika ada)

### Security
- [ ] Passphrase admin diubah dari default
- [ ] Password database kuat
- [ ] SSL/HTTPS aktif
- [ ] Firewall dikonfigurasi
- [ ] Backup otomatis di-setup

### Testing
- [ ] Test login sebagai owner
- [ ] Test CRUD prompt
- [ ] Test approve/reject order
- [ ] Test copy limit (user gratis vs premium)
- [ ] Test Prompt Troubleshooter (premium only)

### Performance
- [ ] Lighthouse score > 80
- [ ] Load time < 3 detik
- [ ] Database indexes aktif
- [ ] Image optimization

### Monitoring
- [ ] Error logging di-setup
- [ ] Analytics (Google Analytics / Plausible)
- [ ] Uptime monitoring (UptimeRobot / Pingdom)
- [ ] Alert untuk downtime

---

## 📞 SUPPORT

Jika ada masalah:

1. Baca dokumentasi di folder ini
2. Cek log error di terminal/browser console
3. Jalankan query di `supabase/admin-queries.sql` untuk debug
4. Hubungi developer

---

## 📚 FILE-FILE PENTING

```
project/
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   ├── components/               # React components
│   ├── db/                       # Database schema (Drizzle)
│   ├── lib/                      # Utilities
│   └── scripts/                  # Seed scripts
├── supabase/                     # SQL files untuk Supabase
│   ├── schema.sql               # ⭐ Schema lengkap
│   ├── register-owner.sql       # ⭐ Register owner
│   └── admin-queries.sql        # ⭐ Query admin
├── INSTALL_GUIDE.md             # Panduan ini
└── SUPABASE_DEPLOYMENT.md       # Panduan Supabase
```

---

## ✅ SELESAI!

Anda sudah siap menjalankan Start Digital AI Prompt Premium.

**Next steps:**
1. Promosikan ke audiens target
2. Monitor traffic dan conversion
3. Tambah prompt baru secara berkala
4. Collect feedback dari user
5. Iterasi fitur berdasarkan data

**Selamat berbisnis! 🚀**
