# 💳 Panduan Setup Midtrans Payment Gateway

Aplikasi Start Digital sudah terintegrasi dengan **Midtrans Snap** untuk menerima pembayaran online.

---

## 📋 Daftar Isi

1. [Buat Akun Midtrans](#1-buat-akun-midtrans)
2. [Get API Keys](#2-get-api-keys)
3. [Set Environment Variables](#3-set-environment-variables)
4. [Konfigurasi Webhook (Notifikasi)](#4-konfigurasi-webhook-notifikasi)
5. [Testing Sandbox](#5-testing-sandbox)
6. [Go-Live Production](#6-go-live-production)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Buat Akun Midtrans

1. Buka [https://dashboard.midtrans.com/](https://dashboard.midtrans.com/)
2. Klik **"Sign Up"**
3. Pilih **"Individual"** atau **"Business"**
4. Isi data & verifikasi email
5. Lengkapi profil bisnis

**Ada 2 mode:**
- **Sandbox** — untuk testing (tidak ada pembayaran real)
- **Production** — untuk transaksi asli

---

## 2. Get API Keys

### Sandbox (untuk testing)

1. Login ke [Sandbox Dashboard](https://dashboard.sandbox.midtrans.com/)
2. Menu: **Settings → Access Keys**
3. Copy 2 key ini:
   - **Merchant ID**
   - **Client Key** (dimulai `SB-Mid-client-...`)
   - **Server Key** (dimulai `SB-Mid-server-...`)

### Production (setelah go-live)

1. Login ke [Production Dashboard](https://dashboard.midtrans.com/)
2. Menu: **Settings → Access Keys**
3. Copy Client Key & Server Key (tanpa prefix `SB-`)

---

## 3. Set Environment Variables

Buka file `.env` di project Anda dan tambahkan:

```bash
# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-XXXXXXXXXXXXX
MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXXXXXX
MIDTRANS_IS_PRODUCTION=false
```

### Untuk Vercel/Railway/VPS

Tambahkan environment variables yang sama di dashboard hosting Anda:

| Variable | Value | Deskripsi |
|----------|-------|-----------|
| `MIDTRANS_SERVER_KEY` | `SB-Mid-server-xxx` | Server key (RAHASIA) |
| `MIDTRANS_CLIENT_KEY` | `SB-Mid-client-xxx` | Client key (public) |
| `MIDTRANS_IS_PRODUCTION` | `false` atau `true` | Mode |

**⚠️ PENTING:**
- `SERVER_KEY` **JANGAN PERNAH** di-expose ke client
- `CLIENT_KEY` boleh public (dipakai di script Snap)

---

## 4. Konfigurasi Webhook (Notifikasi)

Midtrans akan mengirim notifikasi ke aplikasi Anda saat status pembayaran berubah.

### Set Webhook URL

1. Login ke Midtrans Dashboard
2. Menu: **Settings → Configuration**
3. Isi **Payment Notification URL**:
   ```
   https://yourdomain.com/api/payment/webhook
   ```

   Contoh:
   - Development (via ngrok): `https://xxx.ngrok.io/api/payment/webhook`
   - Production: `https://startdigital.id/api/payment/webhook`

4. Isi **Finish Redirect URL**:
   ```
   https://yourdomain.com/pembayaran/sukses
   ```

5. Isi **Unfinish Redirect URL**:
   ```
   https://yourdomain.com/pembayaran/menunggu
   ```

6. Isi **Error Redirect URL**:
   ```
   https://yourdomain.com/pembayaran/gagal
   ```

7. Klik **"Update"**

### Test Webhook

Setelah webhook di-set, di halaman **Settings → Configuration**, ada tombol:
- **"Send test notification"**

Klik dan cek log server Anda. Response harus `200 OK`.

---

## 5. Testing Sandbox

### Test Card

Gunakan kartu berikut di sandbox mode:

| Metode | Detail |
|--------|--------|
| **Credit Card - Accepted** | `4811 1111 1111 1114` |
| **CVV** | `123` |
| **Exp** | `01/25` (bebas future date) |
| **OTP** | `112233` |
| **3DS Password** | `112233` |

**Kartu ditolak (untuk test error):**
- `4911 1111 1111 1113`

### Test GoPay/OVO/DANA

Di sandbox, semua e-wallet muncul QR code fake — cukup klik **"Success"** di halaman test.

### Test Bank Transfer/VA

Untuk VA (Virtual Account), sandbox tidak akan pernah menerima pembayaran real. Anda bisa **manually complete** transaksi dari Midtrans Sandbox Dashboard.

### Flow Testing Lengkap

1. Buka aplikasi Anda: `http://localhost:3000`
2. Daftar akun baru dengan paket **Pro Bulanan**
3. Anda akan otomatis redirect ke `/pembayaran/[orderId]`
4. Klik tombol **"Bayar Rp99.000"**
5. Snap popup Midtrans akan muncul
6. Pilih metode → gunakan test data di atas
7. Setelah sukses, akan redirect ke `/pembayaran/sukses`
8. Cek dashboard: akun sudah upgrade ke premium

---

## 6. Go-Live Production

Setelah testing sandbox selesai:

### Step 1: Aktifkan Production Account

1. Di Midtrans Dashboard, lengkapi:
   - Data bisnis lengkap
   - Rekening bank untuk penerimaan dana
   - Dokumen KTP/NPWP (untuk verifikasi)
2. Submit untuk approval Midtrans
3. Tunggu email konfirmasi (biasanya 1-3 hari kerja)

### Step 2: Get Production Keys

1. Login ke [Production Dashboard](https://dashboard.midtrans.com/)
2. Copy `MIDTRANS_SERVER_KEY` & `MIDTRANS_CLIENT_KEY` (tanpa `SB-`)

### Step 3: Update Environment

```bash
MIDTRANS_SERVER_KEY=Mid-server-XXXXXXXXXXXXX
MIDTRANS_CLIENT_KEY=Mid-client-XXXXXXXXXXXXX
MIDTRANS_IS_PRODUCTION=true
```

### Step 4: Update Webhook Production

Set webhook URL production di Midtrans production dashboard:
```
https://startdigital.id/api/payment/webhook
```

### Step 5: Deploy Ulang

Deploy aplikasi dengan environment production. Selesai!

---

## 7. Troubleshooting

### Masalah: "Midtrans belum dikonfigurasi"

**Solusi:**
- Cek `.env` sudah ada `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY`
- Restart server: `npm run build && npm start`

### Masalah: Snap popup tidak muncul

**Solusi:**
- Cek console browser (F12) untuk error
- Pastikan `MIDTRANS_CLIENT_KEY` benar
- Pastikan script `snap.js` bisa di-load (tidak diblokir adblock)

### Masalah: Webhook tidak dipanggil

**Solusi:**
- Cek URL webhook di Midtrans dashboard **HARUS HTTPS** (untuk production)
- Untuk development, gunakan [ngrok](https://ngrok.com/) untuk expose localhost
- Cek log server saat Midtrans klik "Send test notification"

### Masalah: Signature invalid

**Solusi:**
- Pastikan `MIDTRANS_SERVER_KEY` di environment SAMA dengan yang di dashboard
- Cek tidak ada spasi ekstra di key

### Masalah: Status tidak update setelah bayar

**Solusi:**
- Cek webhook URL sudah diset
- Cek notification log di Midtrans Dashboard → Settings → Configuration → Notification History
- Manually cek status via API: `GET /api/payment/order/[orderId]`

### Masalah: Payment Popup terus loading

**Solusi:**
- Cek koneksi internet
- Cek Midtrans server status: [https://status.midtrans.com/](https://status.midtrans.com/)

---

## 📚 Referensi

- [Dokumentasi Midtrans Snap](https://docs.midtrans.com/reference/snap-integration)
- [Dashboard Sandbox](https://dashboard.sandbox.midtrans.com/)
- [Dashboard Production](https://dashboard.midtrans.com/)
- [Status Midtrans](https://status.midtrans.com/)

---

## 🎯 API Endpoints yang Tersedia

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/payment/config` | GET | Get client key (untuk load Snap) |
| `/api/payment/create` | POST | Buat Snap transaction |
| `/api/payment/webhook` | POST | Terima notifikasi Midtrans |
| `/api/payment/order/[id]` | GET | Get detail order |

## 🎯 Halaman Payment yang Tersedia

| Path | Deskripsi |
|------|-----------|
| `/pembayaran/[orderId]` | Halaman detail order + tombol bayar |
| `/pembayaran/sukses?orderId=X` | Konfirmasi pembayaran berhasil |
| `/pembayaran/gagal?orderId=X` | Info pembayaran gagal + retry |
| `/pembayaran/menunggu?orderId=X` | Menunggu pembayaran (polling status) |

---

**Selamat menerima pembayaran online! 💰**
