/**
 * exportUtils.js
 * Utilitas untuk export data ke Excel/CSV, Cetak Laporan Resmi Per Kelas, dan Pembuatan Bukti Setor
 */

const ExportUtils = {
  /**
   * Ekspor data tabel rangkuman ke file CSV yang kompatibel dengan Microsoft Excel
   * @param {Array} data - Array data rangkuman yang akan diekspor
   * @param {string} className - Nama kelas (atau 'Semua-Kelas')
   * @param {string} date - Tanggal Jum'at
   */
  exportToCSV(data, className = "Semua-Kelas", date = "Semua-Tanggal") {
    if (!data || data.length === 0) {
      alert("Tidak ada data yang dapat diekspor.");
      return;
    }

    // Header CSV
    const headers = [
      "No",
      "ID Tugas",
      "Tanggal Jum'at",
      "Nama Siswa",
      "NISN",
      "Kelas",
      "Nama Masjid",
      "Alamat Masjid",
      "Nama Khatib",
      "Tema / Judul Khutbah",
      "Isi Rangkuman",
      "Dalil / Ayat / Hadits",
      "Pesan Moral & Aksi Nyata",
      "Waktu Pengumpulan",
      "Status Penilaian",
      "Nilai (0-100)",
      "Catatan Guru"
    ];

    // Escape CSV cell
    const escapeCSV = (text) => {
      if (text === null || text === undefined) return '""';
      const str = String(text).replace(/"/g, '""').replace(/\r\n|\n|\r/g, ' ');
      return `"${str}"`;
    };

    const rows = data.map((item, index) => [
      index + 1,
      item.id,
      item.fridayDate,
      item.studentName,
      item.nisn || "-",
      item.className,
      item.mosqueName,
      item.mosqueAddress || "-",
      item.khatibName || "-",
      item.khutbahTitle,
      item.summaryText,
      item.quranHadith || "-",
      item.moralAction || "-",
      item.submittedAt ? item.submittedAt.replace("T", " ") : "-",
      item.status === "graded" ? "Sudah Dinilai" : (item.status === "revision" ? "Perlu Revisi" : "Menunggu"),
      item.score !== null && item.score !== undefined ? item.score : "-",
      item.feedback || "-"
    ].map(escapeCSV).join(";")); // Menggunakan titik koma (;) standar Excel Indonesia/Windows

    // Gabungkan dengan BOM UTF-8 (\uFEFF) agar simbol dan huruf terbaca mulus di Excel
    const csvContent = "\uFEFF" + [headers.map(escapeCSV).join(";"), ...rows].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const cleanClassName = className.replace(/\s+/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Khutbah_Jumat_${cleanClassName}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Buka jendela cetak laporan resmi per kelas
   * @param {Array} data - Array data rangkuman kelas
   * @param {string} className - Kelas yang dicetak
   * @param {string} date - Tanggal Jum'at
   */
  printClassReport(data, className = "Semua Kelas", date = "Semua Tanggal") {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk dicetak.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const rowsHtml = data.map((item, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${item.studentName}</strong><br><small style="color: #666;">NISN: ${item.nisn || '-'}</small></td>
        <td style="text-align: center;">${item.className}</td>
        <td>${item.mosqueName}</td>
        <td><em>${item.khutbahTitle}</em><br><small style="color: #555;">Khatib: ${item.khatibName || '-'}</small></td>
        <td style="text-align: center;">
          <span class="badge ${item.status}">
            ${item.status === 'graded' ? 'Dinilai' : 'Menunggu'}
          </span>
        </td>
        <td style="text-align: center; font-weight: bold; font-size: 15px;">
          ${item.score !== null && item.score !== undefined ? item.score : '-'}
        </td>
        <td style="font-size: 11px;">${item.feedback || '-'}</td>
      </tr>
    `).join("");

    const avgScore = data.filter(d => d.score !== null).length > 0
      ? (data.filter(d => d.score !== null).reduce((a, b) => a + Number(b.score), 0) / data.filter(d => d.score !== null).length).toFixed(1)
      : "-";

    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Rangkuman Khutbah Jum'at - ${className}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111;
            padding: 20px;
            background: #fff;
            margin: 0;
            font-size: 12px;
          }
          .header-kop {
            text-align: center;
            border-bottom: 3px double #001fb8;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header-kop h2 {
            margin: 0 0 4px 0;
            font-size: 20px;
            color: #001fb8;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          .header-kop h3 {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #ff5100;
            font-weight: 700;
          }
          .header-kop p {
            margin: 0;
            font-size: 11px;
            color: #444;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #333;
            padding: 7px 8px;
            vertical-align: middle;
          }
          th {
            background-color: #eef2ff;
            color: #001fb8;
            font-weight: bold;
            text-align: center;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
          }
          .badge.graded { background: #dcfce7; color: #166534; }
          .badge.pending { background: #ffedd5; color: #9a3412; }
          .summary-box {
            margin-bottom: 25px;
            display: flex;
            gap: 20px;
            font-size: 12px;
          }
          .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
            width: 220px;
          }
          .sig-space {
            height: 70px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: right;">
          <button onclick="window.print()" style="padding: 8px 18px; background: #001fb8; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">🖨️ Cetak / Simpan PDF</button>
        </div>

        <div class="header-kop">
          <h2>SMA YWKA</h2>
          <h3>REKAPITULASI PELAPORAN TUGAS RANGKUMAN KHUTBAH JUM'AT</h3>
          <p>Tahun Ajaran 2026/2027 • Mata Pelajaran Pendidikan Agama Islam & Budi Pekerti</p>
        </div>

        <div class="meta-info">
          <div>
            <strong>Kelas:</strong> ${className}<br>
            <strong>Pelaksanaan:</strong> Jum'at, ${date}
          </div>
          <div style="text-align: right;">
            <strong>Total Pengumpulan:</strong> ${data.length} Siswa<br>
            <strong>Rata-Rata Nilai:</strong> ${avgScore}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th style="width: 160px;">Nama Siswa</th>
              <th style="width: 60px;">Kelas</th>
              <th style="width: 130px;">Masjid</th>
              <th>Tema / Judul Khutbah</th>
              <th style="width: 70px;">Status</th>
              <th style="width: 50px;">Nilai</th>
              <th style="width: 140px;">Catatan Guru</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="sig-box">
            <p>Mengetahui,<br><strong>Wali Kelas ${className}</strong></p>
            <div class="sig-space"></div>
            <p>__________________________<br>NIP. ................................</p>
          </div>
          <div class="sig-box">
            <p>Yogyakarta, ${today}<br><strong>Guru Pendidikan Agama Islam</strong></p>
            <div class="sig-space"></div>
            <p><strong>Drs. H. M. Sholihin, M.Pd.I</strong><br>NIP. 19780512 200501 1 004</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

window.ExportUtils = ExportUtils;
