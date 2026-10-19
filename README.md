# 🕌 KhatibKu - Portal Pelaporan & Monitoring Rangkuman Khutbah Jum'at SMA YWKA

Website resmi SMA YWKA untuk pengumpulan tugas dan rekapitulasi nilai rangkuman khutbah Jum'at berbasis kelas, dengan sistem terpisah antara **Portal Siswa** dan **Portal Master Guru**.

![Logo SMA YWKA](assets/logo-ywka.png)

---

## 🎨 Identitas Warna Resmi (Berdasarkan Logo SMA YWKA)
- 🔵 **Royal Blue (`#001FB8`)**: Melambangkan kebijaksanaan, ketegasan, dan naungan pendidikan.
- 🟠 **Vibrant Orange (`#FF5100`)**: Melambangkan semangat pemuda, inovasi, dan kehangatan.
- 🟢 **Leaf Green (`#1EA22E`)**: Melambangkan nilai-nilai akhlak Islami dan pertumbuhan karakter.
- ⚫ **Charcoal / Slate (`#2D3139`)**: Tipografi modern yang nyaman dibaca di layar HP & laptop.

---

## 🏛️ Dua Portal Terpisah

### 1. 🎒 Portal Siswa (`index.html`)
- **Tujuan:** Khusus untuk siswa mengisi dan mengumpulkan tugas rangkuman khutbah Jum'at setiap pekan.
- **Privasi:** Siswa hanya melihat formulir mereka sendiri, tidak dapat melihat nilai atau mengedit data siswa lain.
- **Fitur Siswa:**
  - Pilihan kelas (X-A, X-B, XI-MIPA, XI-IPS, XII, dll.).
  - Pengisian nama masjid, alamat, dan penceramah/khatib.
  - Penulisan judul, dalil Al-Qur'an/hadits, isi rangkuman, dan komitmen aksi nyata.
  - Upload foto dokumentasi kehadiran masjid / catatan tangan dengan preview instan.
  - **Tanda Terima Digital:** Siswa memperoleh kartu bukti penyerahan tugas resmi ber-ID unik (`JUM-YYYYMMDD-XXX`) yang dapat di-screenshot / disimpan.
  - Panduan adab menyimak khutbah Jum'at.

### 2. 👨‍🏫 Portal Master Guru & Wali Kelas (`admin.html`)
- **Tujuan:** Khusus bagi Bapak/Ibu Guru dan Wali Kelas untuk memantau, memeriksa, dan menilai pengumpulan tugas.
- **Keamanan:** Dilindungi **PIN Pengajar** (Default: **`ywka2026`**).
- **Fitur Master Guru:**
  - **Penyaringan Per Kelas (Class Pills):** Menampilkan badge counter jumlah pengumpulan siswa per kelas secara real-time.
  - **Filter Tanggal & Status:** Memfilter pekan Jum'at dan status penilaian (*Menunggu* / *Sudah Dinilai*).
  - **Pencarian Cepat:** Live search nama siswa, judul khutbah, atau masjid.
  - **Lembar Penilaian Siswa:** Guru dapat membaca isi rangkuman, melihat foto bukti yang diunggah, memberi nilai **0–100**, dan menulis catatan apresiasi / koreksi.
  - **📥 Unduh Excel (.csv):** Mengunduh rekap nilai per kelas yang siap diolah di Microsoft Excel.
  - **🖨️ Cetak Lembar Nilai Resmi:** Format laporan cetak resmi ber-kop SMA YWKA dan kolom tanda tangan Wali Kelas & Guru PAI.
  - **📊 Statistik Keaktifan:** Progress bar ketercapaian target pengumpulan per kelas (kuota 32 siswa).
  - **⚡ Sinkronisasi Supabase Cloud:** Pengaturan database cloud terpusat.

---

## 🗄️ Sinkronisasi Database (Supabase Cloud)
Kedua portal terhubung ke database yang sama:
- Saat siswa mengirim tugas melalui `index.html`, datanya langsung tersimpan ke Supabase Cloud.
- Guru yang membuka `admin.html` dari perangkat mana pun langsung melihat laporan masuk tersebut secara *real-time*.

Skema tabel SQL lengkap tersedia pada file: [**`supabase_schema.sql`**](file:///d:/DATA%20SMA%20YWKA/Project/supabase_schema.sql).

---

## 🚀 Pintasan Sekali-Klik (Windows)
- 📌 **`Buka-Portal-Siswa.bat`** ➔ Membuka form pengisian siswa.
- 📌 **`Buka-Portal-Master.bat`** ➔ Membuka dashboard pemantauan & penilaian guru.
- 📌 **`Push-Ke-GitHub.bat`** ➔ Mengunggah pembaruan codingan ke repositori GitHub.
