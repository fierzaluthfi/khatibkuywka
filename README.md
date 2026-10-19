# 🕌 KhatibKu - Portal Pelaporan & Monitoring Rangkuman Khutbah Jum'at SMA YWKA

Website modern dan responsif untuk pengumpulan serta rekapitulasi tugas mingguan rangkuman khutbah Jum'at bagi siswa SMA YWKA, yang dikelompokkan berdasarkan masing-masing kelas.

---

## 🌟 Fitur Utama

### 1. ✍️ Formulir Pengumpulan Tugas Siswa (Mobile & Desktop)
- **Identitas Lengkap:** Nama Siswa, NIS/NISN, Pilihan Kelas (X-A, X-B, XI-MIPA, XI-IPS, XII, dll.), dan Tanggal Shalat Jum'at (otomatis default ke Jum'at terdekat).
- **Detail Shalat Jum'at:** Nama Masjid/Musholla, Alamat Masjid, dan Nama Khatib/Penceramah.
- **Intisari Khutbah:** Judul/Tema, Dalil Al-Qur'an & Hadits yang dikutip, Pokok-pokok Rangkuman Khutbah (lengkap dengan penghitung karakter), serta Komitmen Pesan Moral / Aksi Nyata.
- **Unggah Foto Dokumentasi:** Siswa dapat mengunggah foto suasana masjid, catatan tangan, atau selfie kehadiran dengan preview instan.
- **Tanda Terima Digital (Digital Receipt):** Begitu terkirim, siswa mendapatkan bukti tanda terima resmi ber-ID unik (`JUM-YYYYMMDD-XXX`) yang dapat dicetak atau di-screenshot sebagai bukti setor ke wali kelas.

### 2. 📋 Rekapitulasi Berdasarkan Masing-Masing Kelas (Dashboard Guru / Wali Kelas)
- **Filter Kelas Cepat (Class Pills):** Tombol filter interaktif per kelas (`Semua Kelas`, `X-A`, `X-B`, `XI-MIPA 1`, `XI-IPS 1`, `XII-MIPA 1`, dll.) lengkap dengan badge jumlah siswa yang sudah mengumpulkan secara *real-time*.
- **Penyaringan Tanggal & Status:** Filter berdasarkan tanggal pelaksanaan Jum'at tertentu dan status penilaian (*Menunggu*, *Sudah Dinilai*, *Perlu Revisi*).
- **Pencarian Cepat:** Live search berdasarkan nama siswa, NISN, nama masjid, atau judul khutbah.
- **Modal Periksa & Beri Nilai:** Guru dapat membaca isi rangkuman lengkap, melihat foto dokumentasi, memberi skor nilai (0-100), dan menuliskan catatan apresiasi/koreksi.
- **📥 Ekspor ke Excel (.csv):** Mengunduh rekap nilai dan rangkuman siswa per kelas dalam format CSV yang rapi dan kompatibel langsung dengan Microsoft Excel.
- **🖨️ Cetak Lembar Nilai Resmi:** Menghasilkan lembaran rekap nilai resmi ber-kop SMA YWKA yang siap dicetak atau disimpan ke PDF dengan kolom tanda tangan Wali Kelas dan Guru PAI.

### 3. 📊 Statistik & Monitoring Keaktifan
- Metrik ringkasan: Total Rangkuman Masuk, Rangkuman Dinilai, dan Rata-rata Nilai Siswa.
- Progress bar pencapaian pengumpulan per kelas (dengan target 32 siswa per kelas).

### 4. 📖 Panduan Tugas & Adab Shalat Jum'at
- Memuat hadits shahih mengenai adab mendengarkan khutbah (keharusan diam dan tidak berbicara).
- Tips menyimak dan waktu penulisan rangkuman (seusai shalat agar pahala Jum'at terjaga).
- Rubrik dan kriteria penilaian tugas.

### 5. 🎨 Desain & Estetika Premium
- Tema islami elegan berpalet **Emerald Green & Warm Gold**.
- Dukungan **Mode Terang (Light Mode)** dan **Mode Gelap (Dark Mode)** dengan transisi halus.
- Responsif penuh untuk layar HP (smartphone) siswa maupun laptop/komputer bapak/ibu guru.
- Menggunakan tipografi modern Google Fonts (*Plus Jakarta Sans* & *Outfit*).

---

## 📂 Struktur Berkas

```
d:/DATA SMA YWKA/Project/
├── index.html              # Halaman utama aplikasi web
├── Buka-Website.bat        # Pintasan sekali-klik untuk membuka di Windows
├── README.md               # Dokumentasi penggunaan dan panduan sistem
├── css/
│   └── style.css           # Desain tema islami emerald-gold, dark mode, dan print styling
└── js/
    ├── app.js              # Logika state, event handlers, form, modal, dan interaksi
    ├── sampleData.js       # Data awal demo (siswa kelas X, XI, XII & tanggal Jum'at)
    └── exportUtils.js      # Generator ekspor Excel/CSV dan lembar cetak resmi
```

---

## 🚀 Cara Menggunakan

1. **Membuka Website:**
   - Cukup klik ganda (double click) file **`Buka-Website.bat`**, atau
   - Buka file **`index.html`** langsung menggunakan browser apa pun (Google Chrome, Microsoft Edge, Firefox, Safari).
   - *Tidak membutuhkan instalasi server atau software tambahan.*

2. **Sebagai Siswa:**
   - Pilih tab **"✍️ Kirim Rangkuman"**.
   - Isi nama, pilih kelas Anda, masukkan data masjid, dan tulis rangkuman khutbah.
   - Klik **"🚀 Kirim Rangkuman Khutbah"**.
   - Simpan atau screenshot kode tanda terima yang muncul.

3. **Sebagai Guru / Wali Kelas:**
   - Pilih tab **"📋 Rekap Per Kelas"**.
   - Klik tombol kelas yang ingin diperiksa (misalnya **Kelas X-A**).
   - Klik tombol **"🔍 Periksa"** pada nama siswa untuk membaca rangkuman dan memberikan nilai (0-100).
   - Klik **"📥 Unduh Excel"** untuk mengunduh rekap nilai ke Microsoft Excel, atau klik **"🖨️ Cetak Lembar Nilai"** untuk mencetak laporan resmi.
