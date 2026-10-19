-- ===================================================================
-- SCHEMA DATABASE SUPABASE - PORTAL RANGKUMAN KHUTBAH JUM'AT SMA YWKA
-- Jalankan script SQL ini di Dashboard Supabase: SQL Editor -> New Query -> Run
-- ===================================================================

-- 1. Buat Tabel friday_summaries
CREATE TABLE IF NOT EXISTS friday_summaries (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  nisn TEXT,
  class_name TEXT NOT NULL,
  friday_date DATE NOT NULL,
  mosque_name TEXT NOT NULL,
  mosque_address TEXT,
  khatib_name TEXT,
  khutbah_title TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  quran_hadith TEXT,
  moral_action TEXT,
  photo_url TEXT,
  score NUMERIC(5,2),
  feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'graded', 'revision')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Index untuk mempercepat query per kelas dan tanggal
CREATE INDEX IF NOT EXISTS idx_summaries_class ON friday_summaries (class_name);
CREATE INDEX IF NOT EXISTS idx_summaries_date ON friday_summaries (friday_date);
CREATE INDEX IF NOT EXISTS idx_summaries_status ON friday_summaries (status);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE friday_summaries ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Izinkan siapa saja (siswa) membaca rangkuman (untuk rekap kelas)
CREATE POLICY "Allow public read access"
ON friday_summaries
FOR SELECT
USING (true);

-- 5. Policy: Izinkan siapa saja (siswa) mengirimkan rangkuman tugas
CREATE POLICY "Allow public insert"
ON friday_summaries
FOR INSERT
WITH CHECK (true);

-- 6. Policy: Izinkan update nilai dan catatan oleh guru
CREATE POLICY "Allow public update"
ON friday_summaries
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 7. Policy: Izinkan hapus tugas jika diperlukan
CREATE POLICY "Allow public delete"
ON friday_summaries
FOR DELETE
USING (true);

-- 8. Masukkan Data Sample Awal (Opsional)
INSERT INTO friday_summaries (
  id, student_name, nisn, class_name, friday_date, 
  mosque_name, mosque_address, khatib_name, 
  khutbah_title, summary_text, quran_hadith, moral_action, score, feedback, status
) VALUES 
(
  'JUM-20261016-001',
  'Muhammad Farhan Pratama',
  '0078129410',
  'X-A',
  CURRENT_DATE,
  'Masjid Al-Ikhlas',
  'Jl. Merpati No. 14, Dekat SMA YWKA',
  'Ustadz Dr. H. Rahmat Hidayat, M.Ag',
  'Menjaga Lisan dan Kejujuran di Era Media Digital',
  'Khatib menyampaikan pentingnya memelihara lisan dan jemari kita dalam bermedia sosial. Di era digital saat ini, berita bohong dan ghibah dapat menyebar begitu cepat. Rasulullah SAW bersabda bahwa keselamatan manusia tergantung pada bagaimana ia menjaga lisannya.',
  'QS. Al-Hujurat Ayat 6',
  'Selalu tabayyun saat membaca postingan di media sosial dan tidak menyebarkan fitnah.',
  95,
  'Rangkuman sangat padat, runtut, dan kontekstual. Pertahankan!',
  'graded'
),
(
  'JUM-20261016-002',
  'Ahmad Rizky Fauzan',
  '0075218903',
  'X-A',
  CURRENT_DATE,
  'Masjid Raya Baiturrahman',
  'Jl. Veteran No. 45',
  'Drs. KH. Ahmad Syafii',
  'Birrul Walidain: Berbakti kepada Orang Tua sebagai Pintu Surga',
  'Khatib menegaskan bahwa ridha Allah SWT bergantung pada ridha kedua orang tua. Perjuangan ayah dan ibu dalam mendidik kita tidak ternilai.',
  'HR. Tirmidzi tentang ridha orang tua',
  'Membantu orang tua di rumah dan selalu memohon doa restu sebelum berangkat sekolah.',
  90,
  'Bagus dan menyentuh.',
  'graded'
)
ON CONFLICT (id) DO NOTHING;
