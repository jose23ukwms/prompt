import { LegalList, LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: "Syarat & Ketentuan | Start Digital",
  description: "Syarat penggunaan layanan Start Digital AI Prompt Premium.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Dokumen Legal"
      title="Syarat & Ketentuan"
      description="Ketentuan ini mengatur penggunaan website, prompt AI, membership, pembayaran, dashboard, dan layanan digital Start Digital AI Prompt Premium."
      updated="5 Juli 2026"
    >
      <LegalSection title="1. Persetujuan terhadap Ketentuan">
        <p>Dengan mengakses, mendaftar, membeli paket, atau menggunakan layanan Start Digital, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat & Ketentuan serta Kebijakan Privasi. Jika tidak setuju, hentikan penggunaan layanan.</p>
      </LegalSection>

      <LegalSection title="2. Definisi Layanan">
        <p>“Layanan” mencakup katalog prompt AI, prompt lanjutan, workflow, Prompt Troubleshooter, AI Assistant, dashboard, membership, file digital, dan fitur terkait. “Pengguna” mencakup pengunjung anonim, pengguna gratis, member berbayar, dan pelanggan enterprise.</p>
      </LegalSection>

      <LegalSection title="3. Akses Gratis dan Masa Evaluasi">
        <LegalList items={[
          <>Akses gratis berlaku selama <b>7 hari</b> sejak perangkat/browser pertama kali teridentifikasi oleh sistem.</>,
          <>Paket gratis dapat menyalin setiap prompt yang diizinkan maksimal <b>1 kali per prompt</b>.</>,
          <>Konten prompt pada mode gratis dapat dibatasi dari seleksi teks, klik kanan, dan penyalinan manual.</>,
          <>Setelah masa 7 hari berakhir, pengguna harus berlangganan untuk melanjutkan akses area produk.</>,
          <>Identifikasi perangkat menggunakan cookie HTTP-only dan catatan database. Menghapus atau memanipulasi cookie untuk menghindari pembatasan merupakan pelanggaran ketentuan.</>,
        ]} />
      </LegalSection>

      <LegalSection title="4. Akun, Identitas, dan Keamanan">
        <LegalList items={[
          "Pengguna wajib memberikan informasi yang akurat dan terkini.",
          "Pengguna bertanggung jawab menjaga keamanan email, perangkat, sesi, dan kredensialnya.",
          "Akun tidak boleh dijual, dipindahtangankan, dibagikan massal, atau digunakan untuk menghindari batas paket.",
          "Kami dapat menangguhkan akun bila terdapat dugaan penyalahgunaan, fraud, scraping, atau pelanggaran keamanan.",
        ]} />
      </LegalSection>

      <LegalSection title="5. Membership dan Benefit">
        <p>Benefit yang diterima mengikuti paket yang tampil pada halaman Harga saat transaksi dibuat. Fitur dapat ditambah, disempurnakan, atau diganti dengan fitur setara. Penurunan material pada paket aktif akan diinformasikan secara wajar.</p>
      </LegalSection>

      <LegalSection title="6. Pembayaran dan Midtrans">
        <LegalList items={[
          "Pembayaran diproses oleh Midtrans atau mitra pembayaran yang ditampilkan saat checkout.",
          "Kami tidak menyimpan nomor kartu, CVV, PIN, atau kredensial bank pengguna.",
          "Akun premium aktif setelah status pembayaran dinyatakan settlement/capture yang sah atau disetujui admin.",
          "Biaya bank, pajak, kurs, atau biaya kanal pembayaran dapat berlaku sesuai kebijakan penyedia pembayaran.",
          "Transaksi yang ditolak, kedaluwarsa, dibatalkan, atau terindikasi fraud tidak mengaktifkan benefit premium.",
        ]} />
      </LegalSection>

      <LegalSection title="7. Pembatalan dan Pengembalian Dana">
        <p>Produk digital dianggap dikirim ketika akses premium diaktifkan. Permintaan refund ditinjau kasus per kasus, terutama untuk pembayaran ganda, kegagalan sistem yang terverifikasi, atau akses yang tidak pernah aktif. Permintaan harus dikirim maksimal 7 hari setelah transaksi ke help@startdigital.app dengan bukti pembayaran. Perubahan pikiran, ketidakcocokan model AI, atau kesalahan input pengguna tidak otomatis memenuhi syarat refund.</p>
      </LegalSection>

      <LegalSection title="8. Lisensi Penggunaan Prompt">
        <LegalList items={[
          "Pengguna memperoleh lisensi terbatas, non-eksklusif, dan tidak dapat dipindahtangankan untuk memakai prompt dalam pekerjaan atau bisnisnya.",
          "Output yang dihasilkan AI dapat digunakan oleh pengguna dengan tunduk pada ketentuan model AI dan hukum yang berlaku.",
          "Dilarang menjual ulang katalog prompt, menyalin massal, membagikan akun, membuat mirror, scraping, atau mengemas ulang database prompt sebagai produk pesaing.",
          "Lisensi enterprise dapat memiliki ketentuan khusus berdasarkan perjanjian tertulis.",
        ]} />
      </LegalSection>

      <LegalSection title="9. Keterbatasan dan Tanggung Jawab atas Output AI">
        <p>Prompt dirancang untuk meningkatkan kualitas instruksi, tetapi tidak menjamin output selalu benar, bebas bias, bebas pelanggaran, atau sesuai semua kebutuhan. Pengguna wajib memverifikasi fakta, kode, keamanan, referensi, legalitas, dan keputusan penting sebelum digunakan. Output AI bukan nasihat hukum, medis, keuangan, pajak, atau profesional.</p>
      </LegalSection>

      <LegalSection title="10. Penggunaan yang Dilarang">
        <LegalList items={[
          "Aktivitas ilegal, penipuan, malware, phishing, spam, eksploitasi, atau pelanggaran privasi.",
          "Mencoba memperoleh server key, database credential, admin passphrase, atau rahasia sistem.",
          "Mengganggu layanan melalui bot, scraping agresif, denial of service, atau bypass pembatasan.",
          "Menggunakan layanan untuk melanggar hak cipta, merek, rahasia dagang, atau hak pihak ketiga.",
        ]} />
      </LegalSection>

      <LegalSection title="11. Ketersediaan dan Perubahan Layanan">
        <p>Kami berupaya menjaga layanan tersedia, tetapi tidak menjamin tanpa gangguan. Maintenance, perubahan API pihak ketiga, Supabase, Vercel, Midtrans, Google, atau penyedia AI dapat memengaruhi layanan. Kami dapat memperbarui fitur dan ketentuan untuk keamanan, kepatuhan, atau perkembangan produk.</p>
      </LegalSection>

      <LegalSection title="12. Penangguhan dan Pengakhiran">
        <p>Kami dapat membatasi atau menutup akses akibat pelanggaran, fraud, chargeback, penyalahgunaan lisensi, risiko keamanan, atau kewajiban hukum. Pengguna dapat berhenti menggunakan layanan kapan saja; kewajiban pembayaran yang telah terjadi tetap berlaku.</p>
      </LegalSection>

      <LegalSection title="13. Batas Tanggung Jawab">
        <p>Sejauh diizinkan hukum, Start Digital tidak bertanggung jawab atas kerugian tidak langsung, kehilangan data, kehilangan keuntungan, keputusan berdasarkan output AI, atau gangguan pihak ketiga. Tanggung jawab maksimal kami dibatasi pada nilai pembayaran pengguna dalam 3 bulan sebelum klaim, kecuali hukum menentukan lain.</p>
      </LegalSection>

      <LegalSection title="14. Hukum dan Penyelesaian Perselisihan">
        <p>Ketentuan ini tunduk pada hukum Republik Indonesia. Perselisihan diupayakan terlebih dahulu melalui musyawarah dan komunikasi tertulis. Jika tidak selesai, penyelesaian mengikuti forum yang berwenang sesuai peraturan Indonesia.</p>
      </LegalSection>

      <LegalSection title="15. Kontak">
        <p>Pertanyaan, pengaduan, atau permintaan refund dapat dikirim ke <a className="text-indigo-300" href="mailto:help@startdigital.app">help@startdigital.app</a>.</p>
      </LegalSection>
    </LegalPage>
  );
}
