# 🚀 Deploy ke Hostinger (hPanel Shared Hosting)

> **PENTING:** Hostinger hPanel **shared hosting tidak mendukung Node.js runtime**.
> Artinya Anda **tidak bisa** menjalankan Next.js secara native di hPanel.
>
> Solusi yang tersedia:
> 1. **Vercel (GRATIS) + Domain Hostinger** ← ⭐ Direkomendasikan
> 2. Hostinger VPS (berbayar, support Node.js)
> 3. Static Export (terbatas, tidak ada API/database)

---

## ⭐ SOLUSI 1: Vercel (GRATIS) + Domain Hostinger

Ini adalah solusi **paling direkomendasikan** karena:
- ✅ Vercel support Next.js native (terbaik di dunia)
- ✅ GRATIS untuk personal project
- ✅ Auto-deploy dari GitHub
- ✅ SSL/HTTPS otomatis
- ✅ CDN global (cepat di Indonesia)
- ✅ Database tetap di Supabase (cloud)

### Alur Kerja

```
User → Domain Hostinger → DNS Vercel → Aplikasi Next.js di Vercel
                                      ↓
                              Supabase PostgreSQL (database)
```

### Langkah 1: Deploy ke Vercel

1. **Push code ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "Production ready"
   git branch -M main
   git remote add origin https://github.com/USERNAME/start-digital.git
   git push -u origin main
   ```

2. **Buat akun Vercel**
   - Buka [vercel.com](https://vercel.com/)
   - Sign up dengan GitHub
   - Verifikasi email

3. **Import project**
   - Dashboard Vercel → "Add New Project"
   - Import Git Repository → Pilih repo `start-digital`
   - Framework Preset: **Next.js**
   - Klik **Deploy**
   - Tunggu 2-5 menit

4. **Set Environment Variables**
   - Project Settings → Environment Variables
   - Tambahkan:
     ```
     DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
     ADMIN_PASSPHRASE=passphrase-rahasia-anda
     MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
     MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
     MIDTRANS_IS_PRODUCTION=false
     ```
   - Klik **Save**
   - Re-deploy: Project → Deployments → Redeploy

5. **Dapatkan URL Vercel**
   - Contoh: `https://start-digital.vercel.app`
   - Test: Buka URL tersebut di browser

### Langkah 2: Hubungkan Domain Hostinger

1. **Buka Hostinger hPanel**
   - Login ke [hostinger.co.id](https://hostinger.co.id/)
   - Pilih domain Anda
   - Menu: **Domain** → **DNS / Nameservers**

2. **Tambahkan DNS Records**

   Tambahkan **CNAME record**:
   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   TTL: 3600
   ```

   Untuk **apex domain** (tanpa www):
   ```
   Type: A
   Name: @
   Target: 76.76.21.21
   TTL: 3600
   ```

3. **Tambahkan Domain di Vercel**
   - Vercel Dashboard → Project → Settings → Domains
   - Klik **Add Domain**
   - Masukkan: `www.startdigital.id` (atau domain Anda)
   - Klik **Add**
   - Vercel akan verifikasi DNS (biasanya 5-60 menit)

4. **Set Default Domain**
   - Di Vercel → Domains
   - Redirect `startdigital.id` → `www.startdigital.id`
   - Atau sebaliknya (pilih salah satu)

5. **Tunggu Propagasi DNS**
   - Bisa 5 menit - 24 jam (biasanya 15-30 menit)
   - Cek dengan: `dig www.startdigital.id`

### Langkah 3: Verifikasi

Buka domain Anda: `https://www.startdigital.id`

Harusnya:
- ✅ HTTPS aktif (SSL otomatis dari Vercel)
- ✅ Website berjalan normal
- ✅ Database terhubung ke Supabase
- ✅ Login owner berfungsi

---

## 💻 SOLUSI 2: Hostinger VPS (Berbayar)

Jika Anda ingin full control dan menjalankan Node.js di server sendiri:

### VPS yang Direkomendasikan

| Paket | Harga | Spec | Cocok untuk |
|-------|-------|------|-------------|
| KVM 1 | ~Rp50rb/bulan | 1 vCPU, 1GB RAM | Development |
| KVM 2 | ~Rp100rb/bulan | 2 vCPU, 2GB RAM | ⭐ Production |
| KVM 4 | ~Rp200rb/bulan | 4 vCPU, 4GB RAM | High traffic |

### Setup VPS Hostinger

1. **Beli VPS** di Hostinger
2. Pilih OS: **Ubuntu 22.04 LTS**
3. Dapatkan IP Address dan root password

### Install di VPS

SSH ke VPS:
```bash
ssh root@IP_VPS_ANDA
```

Update & install dependencies:
```bash
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

Clone & build project:
```bash
cd /var/www
git clone https://github.com/USERNAME/start-digital.git
cd start-digital
npm install
npm run build
```

Buat file `.env`:
```bash
nano .env
```
Isi dengan:
```bash
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
ADMIN_PASSPHRASE=passphrase-rahasia-anda
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
MIDTRANS_IS_PRODUCTION=false
NODE_ENV=production
PORT=3000
```

Jalankan dengan PM2:
```bash
pm2 start npm --name "start-digital" -- start
pm2 save
pm2 startup
```

Setup Nginx:
```bash
nano /etc/nginx/sites-available/start-digital
```

Isi:
```nginx
server {
    listen 80;
    server_name startdigital.id www.startdigital.id;

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

Setup SSL:
```bash
certbot --nginx -d startdigital.id -d www.startdigital.id
```

Selesai! 🎉

---

## 📁 SOLUSI 3: Static Export (Terbatas)

> ⚠️ **PERINGATAN:** Static export hanya untuk halaman HTML/CSS/JS.
> API routes, database, auth, dan dynamic rendering **TIDAK AKAN BERFUNGSI**.
> Hanya cocok untuk landing page tanpa backend.

### Build Static Export

1. **Update `next.config.ts`**:
   ```typescript
   const nextConfig = {
     output: "export",
     distDir: "dist",
     images: { unoptimized: true },
   };
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Hasil** ada di folder `dist/`

4. **Upload ke Hostinger**:
   - Buka hPanel → File Manager
   - Upload isi folder `dist/` ke `public_html/`
   - Atau gunakan FTP

### Keterbatasan Static Export

| Fitur | Status |
|-------|--------|
| Halaman statis (Home, Harga, Kategori) | ✅ Berfungsi |
| Halaman detail prompt | ⚠️ Hanya yang di-generate saat build |
| API routes (/api/*) | ❌ Tidak berfungsi |
| Database (Drizzle/Supabase) | ❌ Tidak berfungsi |
| Login/Register | ❌ Tidak berfungsi |
| Admin Panel | ❌ Tidak berfungsi |
| Copy tracking | ❌ Tidak berfungsi |
| Midtrans payment | ❌ Tidak berfungsi |

---

## 🎯 REKOMENDASI AKHIR

| Skenario | Solusi | Biaya |
|----------|--------|-------|
| Budget minimal, fitur full | **Vercel (GRATIS)** + Domain Hostinger | Rp0 (domain saja) |
| Full control, budget sedang | **Hostinger VPS KVM 2** | ~Rp100rb/bulan |
| Hanya landing page | **Static Export** ke hPanel | Rp0 |
| Enterprise, high traffic | **VPS Dedicated** atau **AWS/GCP** | Rp500rb+/bulan |

---

## 📞 BANTUAN

Jika ada masalah deploy:

1. **Vercel**: [vercel.com/docs](https://vercel.com/docs)
2. **Hostinger VPS**: [support.hostinger.com](https://support.hostinger.com/)
3. **Next.js Deploy**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**Selamat deploy! 🚀**
