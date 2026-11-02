/**
 * sampleData.js
 * Konfigurasi kelas dan inisialisasi penyimpanan lokal untuk SMA YWKA
 */

const DEFAULT_CLASSES = [
  "X.1", "X.2", "X.3",
  "XI.1", "XI.2", "XI.3",
  "XII.1", "XII.2", "XII.3"
];

// Helper untuk mendapatkan tanggal Jum'at terdekat
function getRecentFriday(weeksAgo = 0) {
  const d = new Date();
  const day = d.getDay();
  // day 5 is Friday
  const diff = (day >= 5 ? day - 5 : day + 2) + (weeksAgo * 7);
  const targetDate = new Date(d.getTime() - (diff * 24 * 60 * 60 * 1000));
  return targetDate.toISOString().split('T')[0];
}

// Data sample awal dikosongkan agar seluruh data murni berasal dari siswa secara up-to-date
const sampleSummaries = [];

// Helper untuk inisialisasi dan pembersihan localStorage
function initStorage() {
  const stored = localStorage.getItem("khatibku_summaries");
  if (stored) {
    try {
      const items = JSON.parse(stored);
      // Hapus data mock/dummy offline lama bulan Oktober (JUM-20261016-xxx & JUM-20261009-xxx)
      const cleanData = items.filter(item => {
        if (!item || !item.id) return false;
        if (item.id.startsWith("JUM-20261016-") || item.id.startsWith("JUM-20261009-")) {
          return false;
        }
        return true;
      });
      localStorage.setItem("khatibku_summaries", JSON.stringify(cleanData));
    } catch (e) {
      localStorage.setItem("khatibku_summaries", "[]");
    }
  } else {
    localStorage.setItem("khatibku_summaries", "[]");
  }

  const storedClasses = localStorage.getItem("khatibku_classes");
  if (!storedClasses || storedClasses.includes("X-A") || !storedClasses.includes("X.1")) {
    localStorage.setItem("khatibku_classes", JSON.stringify(DEFAULT_CLASSES));
  }
}

initStorage();
