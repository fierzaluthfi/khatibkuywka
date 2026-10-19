/**
 * sampleData.js
 * Data awal (mock data) untuk demonstrasi sistem rangkuman khutbah Jum'at SMA YWKA
 */

const DEFAULT_CLASSES = [
  "X-A", "X-B", "X-C",
  "XI-MIPA 1", "XI-MIPA 2", "XI-IPS 1", "XI-IPS 2",
  "XII-MIPA 1", "XII-MIPA 2", "XII-IPS 1", "XII-IPS 2"
];

// Helper untuk mendapatkan tanggal Jum'at terdekat atau Jum'at pekan lalu
function getRecentFriday(weeksAgo = 0) {
  const d = new Date();
  const day = d.getDay();
  // day 5 is Friday
  const diff = (day >= 5 ? day - 5 : day + 2) + (weeksAgo * 7);
  const targetDate = new Date(d.getTime() - (diff * 24 * 60 * 60 * 1000));
  return targetDate.toISOString().split('T')[0];
}

const sampleSummaries = [
  {
    id: "JUM-20261016-001",
    studentName: "Muhammad Farhan Pratama",
    nisn: "0078129410",
    className: "X-A",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid Al-Ikhlas",
    mosqueAddress: "Jl. Merpati No. 14, Dekat SMA YWKA",
    khatibName: "Ustadz Dr. H. Rahmat Hidayat, M.Ag",
    khutbahTitle: "Menjaga Lisan dan Kejujuran di Era Media Digital",
    summaryText: "Khatib menyampaikan pentingnya memelihara lisan dan jemari kita dalam bermedia sosial. Di era digital saat ini, berita bohong (hoaks) dan ghibah dapat menyebar begitu cepat hanya dalam hitungan detik. Rasulullah SAW bersabda bahwa keselamatan manusia tergantung pada bagaimana ia menjaga lisannya. Sebagai generasi muda Muslim, kita wajib melakukan tabayyun (verifikasi) sebelum membagikan informasi apapun.",
    quranHadith: "QS. Al-Hujurat Ayat 6: 'Wahai orang-orang yang beriman! Jika seseorang yang fasik datang kepadamu membawa suatu berita, maka telitilah kebenarannya...'",
    moralAction: "1. Selalu tabayyun saat membaca postingan di media sosial.\n2. Tidak ikut-ikutan menyebarkan ujaran kebencian di grup kelas.\n3. Berkata yang baik atau lebih baik diam.",
    photoUrl: "", // bisa diisi base64 atau placeholder svg
    submittedAt: `${getRecentFriday(0)}T13:15:20`,
    score: 95,
    feedback: "Rangkuman sangat padat, runtut, dan pencantuman ayat Al-Hujurat ayat 6 sangat kontekstual dengan kehidupan remaja zaman sekarang. Pertahankan Farhan!",
    status: "graded" // 'graded', 'pending', 'revision'
  },
  {
    id: "JUM-20261016-002",
    studentName: "Ahmad Rizky Fauzan",
    nisn: "0075218903",
    className: "X-A",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid Raya Baiturrahman",
    mosqueAddress: "Jl. Veteran No. 45",
    khatibName: "Drs. KH. Ahmad Syafii",
    khutbahTitle: "Birrul Walidain: Berbakti kepada Orang Tua sebagai Pintu Surga",
    summaryText: "Khatib menegaskan bahwa ridha Allah SWT bergantung pada ridha kedua orang tua, dan murka Allah juga bergantung pada murka kedua orang tua. Perjuangan ayah dan ibu dalam mendidik kita hingga saat ini tidak akan pernah dapat terbalaskan oleh harta benda. Doa anak yang sholeh adalah salah satu amalan yang tidak terputus setelah orang tua wafat.",
    quranHadith: "HR. Tirmidzi: 'Ridha Allah ada pada ridha kedua orang tua dan murka Allah ada pada murka kedua orang tua.'",
    moralAction: "Membantu ibu merapikan rumah setiap pagi sebelum berangkat sekolah dan senantiasa mencium tangan mereka sambil memohon doa restu.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(0)}T13:22:45`,
    score: 90,
    feedback: "Bagus dan menyentuh. Aksi nyatanya konkret untuk diterapkan setiap hari.",
    status: "graded"
  },
  {
    id: "JUM-20261016-003",
    studentName: "Fajar Nugraha",
    nisn: "0081290312",
    className: "X-A",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid Al-Muhajirin",
    mosqueAddress: "Komplek Perumahan Griya Asri",
    khatibName: "Ust. Zulkifli, S.Pd.I",
    khutbahTitle: "Kedisiplinan Waktu dalam Menuntut Ilmu",
    summaryText: "Waktu adalah nikmat terbesar yang sering dilalaikan manusia. Khatib mengutip sumpah Allah 'Wal Ashr' bahwa manusia benar-benar dalam kerugian jika tidak memanfaatkan waktu untuk beriman, beramal sholeh, dan saling menasehati dalam kebenaran dan kesabaran.",
    quranHadith: "QS. Al-'Ashr ayat 1-3",
    moralAction: "Tidak menunda tugas sekolah dan hadir tepat waktu pada jam pertama belajar.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(0)}T13:40:11`,
    score: null,
    feedback: "",
    status: "pending"
  },
  {
    id: "JUM-20261016-004",
    studentName: "Bagas Satria Wibowo",
    nisn: "0074412098",
    className: "X-B",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid Jami' An-Nur",
    mosqueAddress: "Jl. Stasiun Lama No. 8",
    khatibName: "Ustadz H. Syamsul Maarif",
    khutbahTitle: "Memakmurkan Masjid di Usia Belia",
    summaryText: "Pemuda yang hatinya terpaut dengan masjid termasuk ke dalam 7 golongan yang akan mendapat naungan Allah di hari kiamat kelak. Khatib mengajak para pelajar untuk tidak hanya datang saat shalat Jum'at saja, tetapi membiasakan shalat berjamaah lima waktu dan aktif dalam kegiatan remaja masjid.",
    quranHadith: "HR. Bukhari dan Muslim tentang 7 golongan yang dinaungi Allah.",
    moralAction: "Ikut aktif di kepengurusan Rohis sekolah dan membiasakan shalat Dzuhur berjamaah di musholla sekolah.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(0)}T13:30:10`,
    score: 88,
    feedback: "Penulisan baik, teruskan kebiasaan shalat berjamaah di musholla.",
    status: "graded"
  },
  {
    id: "JUM-20261016-005",
    studentName: "Daffa Kurniawan",
    nisn: "0079981240",
    className: "X-B",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid Nurul Falah",
    mosqueAddress: "Jl. Anggrek No. 12",
    khatibName: "Ust. M. Ridwan",
    khutbahTitle: "Meneladani Sifat Amanah Rasulullah",
    summaryText: "Sifat Al-Amin yang dimiliki Rasulullah sejak muda menjadi kunci keberhasilan beliau dalam berdagang maupun berdakwah. Siswa dituntut untuk memegang amanah belajar dan menjauhi kecurangan saat ujian.",
    quranHadith: "QS. Al-Anfal Ayat 27",
    moralAction: "Belajar jujur tidak mencontek saat ujian harian maupun PAS.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(0)}T13:45:00`,
    score: null,
    feedback: "",
    status: "pending"
  },
  {
    id: "JUM-20261016-006",
    studentName: "Zacky Maulana",
    nisn: "0068891234",
    className: "XI-MIPA 1",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid Agung Syuhada",
    mosqueAddress: "Jl. Pahlawan No. 1",
    khatibName: "Prof. Dr. KH. Abdullah Gymnastiar (Kutipan)",
    khutbahTitle: "Ikhlas dalam Beramal dan Menuntut Ilmu",
    summaryText: "Ikhlas bagaikan semut hitam di atas batu hitam di malam yang gelap gulita. Hanya Allah yang mengetahui ketulusan hati kita. Menuntut ilmu IPA atau sains hendaknya diniatkan sebagai sarana mentadabburi kebesaran ciptaan Allah SWT.",
    quranHadith: "QS. Al-Bayyinah Ayat 5",
    moralAction: "Meluruskan niat belajar fisika dan biologi agar bermanfaat bagi umat dan bangsa.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(0)}T13:10:05`,
    score: 92,
    feedback: "Mantap Zacky, menghubungkan materi sains dengan ketauhidan sangat baik.",
    status: "graded"
  },
  {
    id: "JUM-20261016-007",
    studentName: "Rian Hidayatullah",
    nisn: "0069902341",
    className: "XI-MIPA 1",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid Darussalam",
    mosqueAddress: "Jl. Melati Indah Blok B",
    khatibName: "Ust. Ilham Akbar, Lc",
    khutbahTitle: "Pentingnya Bersyukur atas Nikmat Kesehatan",
    summaryText: "Khatib mengingatkan ada dua kenikmatan yang sering membuat manusia tertipu: nikmat sehat dan waktu luang. Kesehatan fisik dan akal harus disyukuri dengan menjaga pola hidup sehat dan beribadah.",
    quranHadith: "HR. Bukhari no. 6412: 'Dua kenikmatan yang memperdayai banyak manusia: kesehatan dan waktu luang.'",
    moralAction: "Menjaga kebersihan diri, istirahat cukup, dan tidak begadang main game.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(0)}T13:28:40`,
    score: null,
    feedback: "",
    status: "pending"
  },
  {
    id: "JUM-20261016-008",
    studentName: "Aldi Saputra",
    nisn: "0065432190",
    className: "XI-IPS 1",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid Babussalam",
    mosqueAddress: "Jl. Teratai No. 22",
    khatibName: "Ust. Faisal Basri, S.Sos.I",
    khutbahTitle: "Ukhuwah Islamiyah dan Solidaritas Sosial",
    summaryText: "Persaudaraan antar sesama muslim ibarat satu tubuh. Jika salah satu anggota tubuh merasakan sakit, maka seluruh tubuh akan ikut merasakannya. Khatib mengajak jamaah untuk memiliki empati tinggi terhadap kawan yang sedang kesusahan.",
    quranHadith: "HR. Muslim: 'Perumpamaan orang-orang mukmin dalam hal saling mencintai, menyayangi, dan mengasihi bagaikan satu tubuh...'",
    moralAction: "Menggalang dana infaq kas kelas untuk teman sekelas yang sedang sakit.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(0)}T13:50:33`,
    score: 87,
    feedback: "Penyampaian ringkas dan bermakna. Bagus!",
    status: "graded"
  },
  {
    id: "JUM-20261016-009",
    studentName: "Wildan Aditya Pratama",
    nisn: "0059918273",
    className: "XII-MIPA 1",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid Baitul Atiq",
    mosqueAddress: "Jl. Cempaka Putih No. 19",
    khatibName: "Drs. H. Munawir, M.M",
    khutbahTitle: "Ikhtiar Maksimal dan Tawakkal Menghadapi Ujian Masa Depan",
    summaryText: "Khutbah ditujukan khusus membakar semangat generasi muda dalam mempersiapkan masa depan dan ujian kelulusan. Setelah berikhtiar dengan belajar sungguh-sungguh, tawakkal menyerahkan hasil kepada Allah akan menghadirkan ketenangan jiwa dan menjauhkan dari rasa stres atau putus asa.",
    quranHadith: "QS. At-Talaq ayat 3: 'Dan barangsiapa bertawakkal kepada Allah niscaya Allah akan mencukupkan (keperluan)nya.'",
    moralAction: "Membuat jadwal belajar persiapan masuk perguruan tinggi dan shalat dhuha/tahajjud secara rutin.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(0)}T13:12:15`,
    score: 96,
    feedback: "Sangat relevan untuk kelas XII. Semangat persiapan SNBP/SNBT!",
    status: "graded"
  },
  {
    id: "JUM-20261016-010",
    studentName: "Reza Ananda Putra",
    nisn: "0057762198",
    className: "XII-IPS 1",
    fridayDate: getRecentFriday(0),
    mosqueName: "Masjid As-Salam",
    mosqueAddress: "Jl. Pemuda No. 70",
    khatibName: "Ust. Wahid Hasjim, S.Ag",
    khutbahTitle: "Menghindari Riba dan Muamalah yang Halal",
    summaryText: "Membahas konsep kejujuran dalam berbisnis, menghindari penipuan dan riba. Pentingnya mencari rezeki yang halal dan thayyib agar membawa keberkahan bagi keluarga.",
    quranHadith: "QS. Al-Baqarah ayat 275: 'Allah menghalalkan jual beli dan mengharamkan riba.'",
    moralAction: "Berlatih berniaga kecil-kecilan secara jujur dan transparan.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(0)}T14:02:18`,
    score: null,
    feedback: "",
    status: "pending"
  },
  // Sample dari Jum'at pekan lalu (untuk testing filter tanggal)
  {
    id: "JUM-20261009-001",
    studentName: "Muhammad Farhan Pratama",
    nisn: "0078129410",
    className: "X-A",
    fridayDate: getRecentFriday(1),
    mosqueName: "Masjid Al-Ikhlas",
    mosqueAddress: "Jl. Merpati No. 14",
    khatibName: "Ust. M. Arifin, M.Pd",
    khutbahTitle: "Meneladani Akhlak Mulia Rasulullah SAW",
    summaryText: "Rasulullah diutus ke muka bumi semata-mata untuk menyempurnakan kemuliaan akhlak. Akhlak terpuji adalah buah dari keimanan yang kokoh di dalam dada.",
    quranHadith: "HR. Ahmad: 'Sesungguhnya aku diutus untuk menyempurnakan kemuliaan akhlak.'",
    moralAction: "Bertegur sapa dengan senyum dan santun kepada bapak/ibu guru di gerbang sekolah.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(1)}T13:18:00`,
    score: 94,
    feedback: "Rangkuman rapi dan lengkap.",
    status: "graded"
  },
  {
    id: "JUM-20261009-002",
    studentName: "Ahmad Rizky Fauzan",
    nisn: "0075218903",
    className: "X-A",
    fridayDate: getRecentFriday(1),
    mosqueName: "Masjid Baiturrahman",
    mosqueAddress: "Jl. Veteran No. 45",
    khatibName: "KH. Anwar Sadat",
    khutbahTitle: "Tanda-tanda Keimanan Seseorang",
    summaryText: "Iman tidak sekadar ucapan lisan, melainkan diyakini dalam hati dan dibuktikan melalui amal perbuatan sholeh dalam kehidupan bermasyarakat.",
    quranHadith: "HR. Muslim tentang cabang-cabang iman.",
    moralAction: "Menyingkirkan duri atau sampah dari jalanan saat menuju sekolah.",
    photoUrl: "",
    submittedAt: `${getRecentFriday(1)}T13:25:12`,
    score: 88,
    feedback: "Cukup baik, tingkatkan pemaparan dalilnya.",
    status: "graded"
  }
];

// Helper untuk inisialisasi localStorage
function initStorage() {
  if (!localStorage.getItem("khatibku_summaries")) {
    localStorage.setItem("khatibku_summaries", JSON.stringify(sampleSummaries));
  }
  if (!localStorage.getItem("khatibku_classes")) {
    localStorage.setItem("khatibku_classes", JSON.stringify(DEFAULT_CLASSES));
  }
}

initStorage();
