import { LegalList, LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: "Kebijakan Privasi | Start Digital",
  description: "Kebijakan pengumpulan, penggunaan, dan perlindungan data Start Digital.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Perlindungan Data"
      title="Kebijakan Privasi"
      description="Kebijakan ini menjelaskan data yang dikumpulkan, tujuan pemrosesan, penggunaan cookie, mitra pemroses, retensi, keamanan, dan hak pengguna."
      updated="5 Juli 2026"
    >
      <LegalSection title="1. Pengendali Data">
        <p>Start Digital AI Prompt Premium dikelola oleh tim perlindungan data kami. Untuk pertanyaan privasi atau permintaan terkait data, hubungi <a className="text-indigo-300" href="mailto:help@startdigital.app">help@startdigital.app</a>.</p>
      </LegalSection>

      <LegalSection title="2. Data yang Kami Kumpulkan">
        <LegalList items={[
          "Data akun: nama, email, nomor telepon/WhatsApp, paket, status akun, role, dan waktu registrasi.",
          "Data transaksi: order ID, paket, nominal, status, jenis pembayaran, waktu pembayaran, dan referensi Midtrans. Kami tidak menyimpan nomor kartu, CVV, PIN, atau password bank.",
          "Data penggunaan: prompt yang disalin, favorit, review, notifikasi, aktivitas dashboard, dan statistik penggunaan.",
          "Data perangkat: identifier perangkat/browser acak, cookie HTTP-only, waktu kunjungan pertama/terakhir, dan tanggal berakhir trial 7 hari.",
          "Data teknis: alamat IP yang dapat tercatat oleh penyedia hosting, browser, sistem operasi, log error, dan informasi keamanan.",
          "Data komunikasi: isi permintaan dukungan, pengaduan, atau korespondensi dengan kami.",
        ]} />
      </LegalSection>

      <LegalSection title="3. Tujuan Pemrosesan">
        <LegalList items={[
          "Menyediakan akun, prompt, membership, dashboard, dan fitur produk.",
          "Menerapkan akses gratis 7 hari dan batas 1x copy per prompt untuk perangkat/user gratis.",
          "Memproses pembayaran, mendeteksi fraud, mengaktifkan paket, dan mengirim notifikasi.",
          "Mengamankan platform, mencegah penyalahgunaan, scraping, dan akses tidak sah.",
          "Menganalisis performa, memperbaiki kualitas prompt, dan mengembangkan fitur.",
          "Memenuhi kewajiban hukum, pajak, audit, atau permintaan otoritas yang sah.",
        ]} />
      </LegalSection>

      <LegalSection title="4. Dasar Pemrosesan">
        <p>Data diproses berdasarkan pelaksanaan kontrak layanan, persetujuan pengguna, kepentingan sah dalam keamanan dan peningkatan produk, serta kewajiban hukum. Bila persetujuan menjadi dasar utama, pengguna dapat menariknya, namun sebagian layanan mungkin tidak dapat dilanjutkan.</p>
      </LegalSection>

      <LegalSection title="5. Cookie dan Identifikasi Perangkat">
        <p>Kami menggunakan cookie esensial untuk sesi, keamanan, dan pencatatan trial. Cookie <code className="rounded bg-white/10 px-1">sd_device_trial</code> bersifat HTTP-only, tidak dapat dibaca JavaScript, dan dapat disimpan lebih lama dari 7 hari agar trial tidak otomatis terulang setelah kedaluwarsa. Database menyimpan tanggal mulai, terakhir terlihat, dan kedaluwarsa. Menghapus cookie dapat memengaruhi identifikasi perangkat; kami dapat menggunakan sinyal keamanan tambahan yang wajar untuk mencegah penyalahgunaan.</p>
      </LegalSection>

      <LegalSection title="6. Mitra Pemroses dan Transfer Data">
        <LegalList items={[
          "Supabase/PostgreSQL untuk penyimpanan database.",
          "Vercel, VPS, Railway, atau penyedia hosting yang dipilih untuk menjalankan aplikasi.",
          "Midtrans untuk pembayaran dan verifikasi transaksi.",
          "Model AI seperti ChatGPT, Claude, Gemini, DeepSeek, atau Copilot hanya ketika pengguna secara sadar menyalin/mengirim prompt ke layanan tersebut.",
          "Google Apps Script/Google Sheets hanya untuk template atau integrasi yang pengguna pilih sendiri.",
        ]} />
        <p>Beberapa penyedia dapat memproses data di luar Indonesia sesuai infrastrukturnya. Kami memilih penyedia bereputasi dan membatasi data sesuai kebutuhan layanan.</p>
      </LegalSection>

      <LegalSection title="7. Data yang Tidak Boleh Dimasukkan ke Prompt">
        <p>Jangan memasukkan password, server key, private API key, nomor kartu, CVV, PIN, data medis sensitif, rahasia perusahaan, atau data pribadi pihak lain tanpa dasar yang sah. Pengguna bertanggung jawab melakukan redaksi atau anonimisasi sebelum memakai prompt pada layanan AI pihak ketiga.</p>
      </LegalSection>

      <LegalSection title="8. Retensi Data">
        <LegalList items={[
          "Data akun aktif disimpan selama akun digunakan dan periode wajar setelahnya.",
          "Data transaksi disimpan sesuai kebutuhan pembukuan, audit, fraud prevention, dan hukum yang berlaku.",
          "Tracking copy dan trial dapat disimpan untuk menjaga limit, keamanan, serta analisis penyalahgunaan.",
          "Log teknis dapat dihapus atau dianonimkan secara berkala sesuai kebutuhan operasional.",
          "Permintaan penghapusan akan diproses kecuali data wajib dipertahankan karena kontrak, sengketa, fraud, atau kewajiban hukum.",
        ]} />
      </LegalSection>

      <LegalSection title="9. Keamanan">
        <p>Kami menerapkan environment variables untuk secret, HTTPS, pembatasan akses, validasi webhook Midtrans, database constraints, audit log, dan kontrol administratif. Meski demikian, tidak ada sistem yang sepenuhnya bebas risiko. Pengguna wajib menjaga perangkat dan emailnya.</p>
      </LegalSection>

      <LegalSection title="10. Hak Pengguna">
        <LegalList items={[
          "Meminta akses atau salinan data pribadi yang kami simpan.",
          "Meminta koreksi data yang tidak akurat.",
          "Meminta penghapusan atau pembatasan data bila diizinkan hukum.",
          "Menarik persetujuan untuk pemrosesan tertentu.",
          "Mengajukan keberatan atau pengaduan terkait pemrosesan data.",
        ]} />
        <p>Permintaan dapat dikirim ke help@startdigital.app. Kami dapat meminta verifikasi identitas sebelum memproses permintaan.</p>
      </LegalSection>

      <LegalSection title="11. Privasi Anak">
        <p>Layanan tidak ditujukan untuk anak yang belum memiliki kapasitas hukum untuk menyetujui layanan digital. Orang tua/wali harus mendampingi penggunaan dan transaksi oleh anak sesuai hukum yang berlaku.</p>
      </LegalSection>

      <LegalSection title="12. Perubahan Kebijakan">
        <p>Kebijakan dapat diperbarui karena perubahan fitur, penyedia, keamanan, atau regulasi. Versi dan tanggal terbaru ditampilkan pada halaman ini. Perubahan material akan diinformasikan melalui website atau notifikasi akun jika memungkinkan.</p>
      </LegalSection>

      <LegalSection title="13. Kontak Privasi">
        <p>Email: <a className="text-indigo-300" href="mailto:help@startdigital.app">help@startdigital.app</a>. Sertakan subjek “Permintaan Privasi” dan email akun agar permintaan dapat diverifikasi.</p>
      </LegalSection>
    </LegalPage>
  );
}
