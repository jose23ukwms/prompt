# 🚀 PANDUAN DEPLOY LENGKAP DARI NOL
## Start Digital AI Prompt Premium
### Dengan Keamanan API Key Maksimal

---

## 📋 PRASYARAT

Sebelum mulai, pastikan Anda sudah punya:

- [ ] **Komputer** (Windows/Mac/Linux)
- [ ] **Koneksi Internet**
- [ ] **Akun GitHub** (gratis)
- [ ] **Akun Vercel** (gratis)
- [ ] **Akun Supabase** (gratis)
- [ ] **Akun Midtrans** (gratis untuk testing)
- [ ] **Domain di Hostinger** (opsional, untuk custom domain)

---

## 🔐 BAGIAN 0: KEAMANAN API KEY (WAJIB DIBACA)

**PENTING:** API Key dan Private Key **TIDAK BOLEH** pernah di-upload ke GitHub atau terlihat oleh orang lain.

### Aturan Keamanan yang Harus Dipatuhi:

| ❌ JANGAN | ✅ HARUS |
|-----------|----------|
| Hardcode API key di kode | Gunakan Environment Variables |
| Commit file `.env` ke Git | Buat file `.env` di `.gitignore` |
| Tulis API key di chat/public | Simpan di tempat aman (password manager) |
| Share screenshot yang ada API key | Gunakan Vercel Environment Variables |

### Cara Kerja Keamanan di Proyek Ini:

1. **Lokal Development** → File `.env` (di komputer Anda saja)
2. **Production (Vercel)** → Environment Variables di dashboard Vercel
3. **GitHub** → Tidak ada API key sama sekali

---

## BAGIAN 1: PERSIAPAN AKUN

### 1.1 Buat Akun GitHub

1. Buka [github.com](https://github.com)
2. Klik **Sign up**
3. Buat akun (gunakan email pribadi)
4. Verifikasi email

### 1.2 Buat Akun Vercel (GRATIS)

1. Buka [vercel.com](https://vercel.com)
2. Klik **Sign Up**
3. Pilih **Continue with GitHub**
4. Authorize Vercel
5. Selesai

### 1.3 Buat Akun Supabase (Database)

1. Buka [supabase.com](https://supabase.com)
2. Klik **Start your project**
3. Sign up dengan GitHub
4. Klik **New Project**
5. Isi:
   - **Name**: `start-digital-prod`
   - **Database Password**: Buat password **KUAT** (simpan di tempat aman!)
   - **Region**: `Southeast Asia (Singapore)`
   - **Pricing Plan**: `Free`
6. Klik **Create new project**
7. Tunggu 1-2 menit sampai project aktif

### 1.4 Buat Akun Midtrans (Payment Gateway)

1. Buka [dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com)
2. Klik **Sign Up**
3. Isi data bisnis (bisa pakai data pribadi untuk testing)
4. Verifikasi email
5. Login ke Sandbox Dashboard

---

## BAGIAN 2: SETUP LOKAL

### 2.1 Clone Repository

Buka **Terminal / Command Prompt** dan jalankan:

```bash
# Buat folder untuk project
mkdir start-digital
cd start-digital

# Clone repository (ganti dengan URL repo Anda)
git clone https://github.com/USERNAME/start-digital.git .
```

Jika belum ada repo, buat baru:

```bash
git init
git branch -M main
```

### 2.2 Install Dependencies

```bash
npm install
```

Tunggu sampai selesai (1-3 menit).

### 2.3 Buat File Environment (PENTING - JANGAN DI-COMMIT)

Buat file `.env` di root project:

```bash
# Windows
echo. > .env

# Mac/Linux
touch .env
```

Buka file `.env` dengan text editor dan isi:

```bash
# ========================================
# DATABASE - SUPABASE
# ========================================
DATABASE_URL=postgresql://postgres:ISI_PASSWORD_ANDA@db.xxxxx.supabase.co:5432/postgres

# ========================================
# ADMIN ACCESS
# ========================================
ADMIN_PASSPHRASE=ganti-dengan-passphrase-super-kuat-123

# ========================================
# MIDTRANS PAYMENT (SANDBOX)
# ========================================
MIDTRANS_SERVER_KEY=SB-Mid-server-ISI_DENGAN_SERVER_KEY_ANDA
MIDTRANS_CLIENT_KEY=SB-Mid-client-ISI_DENGAN_CLIENT_KEY_ANDA
MIDTRANS_IS_PRODUCTION=false

# ========================================
# NODE ENVIRONMENT
# ========================================
NODE_ENV=development
```

### 2.4 Dapatkan DATABASE_URL dari Supabase

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **Settings** (ikon gear) → **Database**
4. Scroll ke **Connection string** → tab **URI**
5. Copy string-nya
6. Ganti `[YOUR-PASSWORD]` dengan password database yang Anda buat
7. Paste ke `DATABASE_URL` di file `.env`

### 2.5 Dapatkan Midtrans API Keys

1. Buka [dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com)
2. Login
3. Menu: **Settings** → **Access Keys**
4. Copy:
   - **Server Key** (dimulai `SB-Mid-server-`)
   - **Client Key** (dimulai `SB-Mid-client-`)
5. Paste ke file `.env`

### 2.6 Setup Git Ignore (Keamanan)

Pastikan file `.env` **TIDAK** di-upload ke GitHub.

Buka file `.gitignore` dan pastikan ada baris ini:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# API Keys (tambahan keamanan)
*.key
*.pem
secrets/
```

---

## BAGIAN 3: SETUP DATABASE SUPABASE

### 3.1 Jalankan Schema SQL

1. Buka Supabase Dashboard
2. Klik menu **SQL Editor** (di sidebar kiri)
3. Klik **New query**
4. Buka file `supabase/schema.sql` di komputer Anda
5. Copy **seluruh isi** file tersebut
6. Paste ke SQL Editor Supabase
7. Klik tombol **Run** (atau tekan `Ctrl + Enter`)
8. Tunggu sampai selesai (biasanya 10-30 detik)
9. Anda akan melihat pesan: `Schema berhasil dibuat!`

### 3.2 Register Owner Account

1. Di SQL Editor, klik **New query** lagi
2. Buka file `supabase/register-owner.sql`
3. Copy dan paste
4. Klik **Run**
5. Verifikasi output:

```sql
SELECT email, role, plan_slug, status 
FROM profiles 
WHERE email = 'ucidesya@gmail.com';
```

Hasil yang diharapkan:
```
email              | role       | plan_slug  | status
-------------------+------------+------------+--------
ucidesya@gmail.com | superadmin | enterprise | active
```

### 3.3 Seed Data (Isi 1120 Prompt)

Kembali ke terminal di komputer Anda:

```bash
# Seed 1070 prompt (70 gratis + 1000 premium)
npx tsx src/scripts/mass-seed.ts

# Seed 50 prompt app builder
npx tsx src/scripts/seed-fullstack-apps.ts
```

Tunggu sampai selesai. Anda akan melihat:
```
✅ Inserted 50 fullstack app builder prompts.
Total prompts now: 1120
```

### 3.4 Verifikasi Data

Di SQL Editor Supabase, jalankan:

```sql
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

## BAGIAN 4: DEPLOY KE VERCEL

### 4.1 Push ke GitHub

```bash
# Inisialisasi git (jika belum)
git init
git branch -M main

# Tambahkan semua file (KECUALI .env)
git add .
git commit -m "Initial production commit"

# Buat repository di GitHub terlebih dahulu, lalu:
git remote add origin https://github.com/USERNAME/start-digital.git
git push -u origin main
```

### 4.2 Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik **Add New Project**
4. Pilih repository `start-digital`
5. Vercel akan otomatis detect **Next.js**
6. **JANGAN KLIK DEPLOY DULU**
7. Klik **Environment Variables**

### 4.3 Set Environment Variables di Vercel (PENTING!)

Klik **Environment Variables** dan tambahkan:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres` | Production, Preview, Development |
| `ADMIN_PASSPHRASE` | `passphrase-rahasia-anda` | Production, Preview, Development |
| `MIDTRANS_SERVER_KEY` | `SB-Mid-server-xxx` | Production, Preview, Development |
| `MIDTRANS_CLIENT_KEY` | `SB-Mid-client-xxx` | Production, Preview, Development |
| `MIDTRANS_IS_PRODUCTION` | `false` | Production, Preview, Development |

**⚠️ CATATAN KEAMANAN:**
- Environment Variables di Vercel **TIDAK AKAN TERLIHAT** di GitHub
- Hanya Anda yang bisa melihatnya di dashboard Vercel
- Vercel akan inject otomatis saat build

### 4.4 Deploy

1. Setelah semua Environment Variables diisi
2. Klik **Deploy**
3. Tunggu 2-5 menit
4. Vercel akan memberikan URL: `https://start-digital-xxx.vercel.app`

### 4.5 Verifikasi Deploy

Buka URL Vercel di browser:

- ✅ Halaman utama muncul
- ✅ Bisa klik "Jelajahi Prompt"
- ✅ Bisa buka detail prompt
- ✅ Login sebagai owner berhasil

---

## BAGIAN 5: HUBUNGKAN DOMAIN HOSTINGER

### 5.1 Tambahkan DNS Record di Hostinger

1. Login ke Hostinger hPanel
2. Pilih domain Anda
3. Menu: **Domain** → **DNS / Nameservers**
4. Tambahkan record berikut:

**Record 1 - Apex Domain:**
```
Type: A
Name: @
Target: 76.76.21.21
TTL: 3600 (Default)
```

**Record 2 - Subdomain www:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
TTL: 3600 (Default)
```

### 5.2 Tambahkan Domain di Vercel

1. Buka Vercel Dashboard
2. Pilih project `start-digital`
3. Menu: **Settings** → **Domains**
4. Klik **Add Domain**
5. Masukkan: `www.startdigital.id` (ganti dengan domain Anda)
6. Klik **Add**
7. Vercel akan verifikasi DNS (biasanya 5-60 menit)

### 5.3 Tunggu Propagasi DNS

- Bisa memakan waktu 5 menit - 24 jam
- Rata-rata: 15-30 menit
- Cek dengan: `nslookup www.startdigital.id`

### 5.4 Verifikasi

Setelah DNS aktif:
- Buka `https://www.startdigital.id`
- Harusnya website berjalan normal
- SSL/HTTPS aktif otomatis

---

## BAGIAN 6: SETUP MIDTRANS PAYMENT

### 6.1 Testing dengan Sandbox (Gratis)

1. Buka [dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com)
2. Login
3. Menu: **Settings** → **Configuration**
4. Isi:
   - **Payment Notification URL**: `https://www.startdigital.id/api/payment/webhook`
   - **Finish Redirect URL**: `https://www.startdigital.id/pembayaran/sukses`
   - **Unfinish Redirect URL**: `https://www.startdigital.id/pembayaran/menunggu`
   - **Error Redirect URL**: `https://www.startdigital.id/pembayaran/gagal`
5. Klik **Update**

### 6.2 Testing Pembayaran

1. Buka website Anda
2. Daftar akun baru dengan paket **Pro Bulanan**
3. Anda akan diarahkan ke halaman pembayaran
4. Klik **Bayar Rp99.000**
5. Gunakan test card:
   - **Card Number**: `4811 1111 1111 1114`
   - **CVV**: `123`
   - **Expiry**: `01/25`
   - **OTP**: `112233`
6. Pembayaran berhasil → redirect ke halaman sukses
7. Cek dashboard → akun sudah upgrade ke premium

### 6.3 Go-Live ke Production (Opsional)

Setelah testing selesai dan ingin menerima pembayaran real:

1. Login ke [dashboard.midtrans.com](https://dashboard.midtrans.com) (Production)
2. Lengkapi data bisnis
3. Submit untuk verifikasi (1-3 hari kerja)
4. Dapatkan Production API Keys
5. Update Environment Variables di Vercel:
   - Ganti `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` dengan key production
   - Set `MIDTRANS_IS_PRODUCTION=true`
6. Update Webhook URL di Midtrans Production Dashboard

---

## BAGIAN 7: VERIFIKASI AKHIR

### 7.1 Checklist Verifikasi

| No | Item | Status |
|----|------|--------|
| 1 | Website bisa diakses via domain | ⬜ |
| 2 | SSL/HTTPS aktif | ⬜ |
| 3 | Bisa daftar akun gratis | ⬜ |
| 4 | Bisa daftar akun Pro Bulanan | ⬜ |
| 5 | Pembayaran Midtrans berfungsi | ⬜ |
| 6 | User gratis hanya bisa copy 1x | ⬜ |
| 7 | User premium bisa copy unlimited | ⬜ |
| 8 | Prompt Troubleshooter hanya untuk premium | ⬜ |
| 9 | Owner (`ucidesya@gmail.com`) bisa login admin | ⬜ |
| 10 | Owner bisa approve/reject order | ⬜ |
| 11 | Database tersimpan di Supabase | ⬜ |
| 12 | API Key tidak terlihat di GitHub | ⬜ |

### 7.2 Test Command

Buka terminal dan jalankan:

```bash
# Test API health
curl https://www.startdigital.id/api/health

# Test config (tidak boleh expose server key)
curl https://www.startdigital.id/api/payment/config

# Test owner access
curl "https://www.startdigital.id/api/auth/access?email=ucidesya@gmail.com"
```

---

## BAGIAN 8: CHECKLIST KEAMANAN API KEY

### ✅ Yang Sudah Dilakukan:

- [x] File `.env` ada di `.gitignore`
- [x] API Key tidak di-commit ke GitHub
- [x] Environment Variables di Vercel (private)
- [x] Server Key Midtrans tidak pernah dikirim ke client
- [x] Webhook signature verification aktif

### 🔒 Tips Keamanan Tambahan:

1. **Jangan pernah** screenshot yang ada API key
2. **Jangan pernah** share file `.env` ke orang lain
3. **Jangan pernah** commit file `.env` ke Git
4. **Selalu** gunakan Environment Variables di production
5. **Ganti** `ADMIN_PASSPHRASE` secara berkala
6. **Monitor** log Vercel secara berkala

---

## 🎉 SELESAI!

Jika semua checklist di atas sudah dicentang, maka:

✅ Aplikasi berjalan di production
✅ Database tersimpan aman di Supabase
✅ Pembayaran Midtrans terintegrasi
✅ API Key tersimpan aman (tidak di GitHub)
✅ Domain Hostinger terhubung
✅ SSL/HTTPS aktif
✅ Owner memiliki akses penuh

---

## 📞 BANTUAN

Jika ada masalah:

1. Baca file `DEPLOY_HOSTINGER.md`
2. Baca file `MIDTRANS_SETUP.md`
3. Baca file `SUPABASE_DEPLOYMENT.md`
4. Cek log di Vercel Dashboard
5. Cek log di Supabase Dashboard

---

**Selamat! Project Anda sudah online dan aman. 🚀**
