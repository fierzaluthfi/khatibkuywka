/**
 * app.js
 * Logika Aplikasi Utama Portal Rangkuman Khutbah Jum'at SMA YWKA
 */

// Application State
const AppState = {
  summaries: [],
  classes: [],
  selectedClassFilter: "all",
  selectedDateFilter: "all",
  selectedStatusFilter: "all",
  searchQuery: "",
  currentViewingSummaryId: null,
  activePhotoBase64: ""
};

// DOM Content Loaded Initializer
document.addEventListener("DOMContentLoaded", () => {
  initData();
  initTheme();
  initFridayDateInput();
  populateClassOptions();
  renderClassFilterPills();
  populateDateFilterDropdown();
  renderSummariesTable();
  updateTopMetrics();
  setupEventListeners();
});

/**
 * 1. Data Initialization & Storage
 */
function initData() {
  const storedSummaries = localStorage.getItem("khatibku_summaries");
  if (storedSummaries) {
    try {
      AppState.summaries = JSON.parse(storedSummaries);
    } catch (e) {
      console.error("Error parsing summaries from localStorage", e);
      AppState.summaries = sampleSummaries || [];
    }
  } else {
    AppState.summaries = sampleSummaries || [];
    saveSummaries();
  }

  const storedClasses = localStorage.getItem("khatibku_classes");
  if (storedClasses) {
    try {
      AppState.classes = JSON.parse(storedClasses);
    } catch (e) {
      AppState.classes = DEFAULT_CLASSES || [];
    }
  } else {
    AppState.classes = DEFAULT_CLASSES || [];
    localStorage.setItem("khatibku_classes", JSON.stringify(AppState.classes));
  }
}

function saveSummaries() {
  localStorage.setItem("khatibku_summaries", JSON.stringify(AppState.summaries));
}

/**
 * 2. Theme Toggle (Light / Dark Mode)
 */
function initTheme() {
  const savedTheme = localStorage.getItem("khatibku_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButtonUI(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("khatibku_theme", newTheme);
  updateThemeButtonUI(newTheme);
}

function updateThemeButtonUI(theme) {
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = theme === "dark" ? "☀️ Mode Terang" : "🌙 Mode Gelap";
  }
}

/**
 * 3. Date & Class Inputs Setup
 */
function initFridayDateInput() {
  const dateInput = document.getElementById("inputFridayDate");
  if (dateInput) {
    // Set default ke Jum'at paling terkini
    dateInput.value = getRecentFriday(0);
  }
}

function populateClassOptions() {
  const selectStudentClass = document.getElementById("inputClass");
  if (!selectStudentClass) return;

  selectStudentClass.innerHTML = '<option value="">-- Pilih Kelas Anda --</option>';
  AppState.classes.forEach(cls => {
    const opt = document.createElement("option");
    opt.value = cls;
    opt.textContent = `Kelas ${cls}`;
    selectStudentClass.appendChild(opt);
  });
}

function populateDateFilterDropdown() {
  const filterDateSelect = document.getElementById("filterFridayDate");
  if (!filterDateSelect) return;

  // Kumpulkan tanggal unik dari data yang ada
  const dates = [...new Set(AppState.summaries.map(s => s.fridayDate))].filter(Boolean);
  dates.sort((a, b) => new Date(b) - new Date(a));

  filterDateSelect.innerHTML = '<option value="all">📅 Semua Tanggal Jum\'at</option>';
  dates.forEach(d => {
    const formattedDate = new Date(d).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = formattedDate;
    filterDateSelect.appendChild(opt);
  });
}

/**
 * 4. Filter Kelas Pills (Berdasarkan Masing-Masing Kelas)
 */
function renderClassFilterPills() {
  const pillsContainer = document.getElementById("classPillsContainer");
  if (!pillsContainer) return;

  pillsContainer.innerHTML = "";

  // Tombol Semua Kelas
  const totalAllCount = AppState.summaries.length;
  const allPill = document.createElement("button");
  allPill.className = `class-pill ${AppState.selectedClassFilter === 'all' ? 'active' : ''}`;
  allPill.innerHTML = `Semua Kelas <span class="pill-count">${totalAllCount}</span>`;
  allPill.addEventListener("click", () => {
    AppState.selectedClassFilter = "all";
    renderClassFilterPills();
    renderSummariesTable();
    updateClassStatistics();
  });
  pillsContainer.appendChild(allPill);

  // Tombol untuk setiap kelas terdaftar
  AppState.classes.forEach(cls => {
    const classCount = AppState.summaries.filter(s => s.className === cls).length;
    const pill = document.createElement("button");
    pill.className = `class-pill ${AppState.selectedClassFilter === cls ? 'active' : ''}`;
    pill.innerHTML = `Kelas ${cls} <span class="pill-count">${classCount}</span>`;
    pill.addEventListener("click", () => {
      AppState.selectedClassFilter = cls;
      renderClassFilterPills();
      renderSummariesTable();
      updateClassStatistics();
    });
    pillsContainer.appendChild(pill);
  });
}

/**
 * 5. Table Rendering & Filtering
 */
function getFilteredSummaries() {
  return AppState.summaries.filter(item => {
    // Filter Kelas
    if (AppState.selectedClassFilter !== "all" && item.className !== AppState.selectedClassFilter) {
      return false;
    }
    // Filter Tanggal
    if (AppState.selectedDateFilter !== "all" && item.fridayDate !== AppState.selectedDateFilter) {
      return false;
    }
    // Filter Status Penilaian
    if (AppState.selectedStatusFilter !== "all" && item.status !== AppState.selectedStatusFilter) {
      return false;
    }
    // Filter Pencarian (Nama, Masjid, Khatib, Tema)
    if (AppState.searchQuery.trim() !== "") {
      const q = AppState.searchQuery.toLowerCase();
      const matchName = item.studentName && item.studentName.toLowerCase().includes(q);
      const matchNisn = item.nisn && item.nisn.toLowerCase().includes(q);
      const matchTitle = item.khutbahTitle && item.khutbahTitle.toLowerCase().includes(q);
      const matchMosque = item.mosqueName && item.mosqueName.toLowerCase().includes(q);
      const matchKhatib = item.khatibName && item.khatibName.toLowerCase().includes(q);
      if (!matchName && !matchNisn && !matchTitle && !matchMosque && !matchKhatib) {
        return false;
      }
    }
    return true;
  });
}

function renderSummariesTable() {
  const tbody = document.getElementById("summariesTableBody");
  const emptyState = document.getElementById("emptyStateTable");
  const countIndicator = document.getElementById("filteredResultCount");

  if (!tbody) return;

  const filtered = getFilteredSummaries();

  if (countIndicator) {
    const classLabel = AppState.selectedClassFilter === 'all' ? 'Semua Kelas' : `Kelas ${AppState.selectedClassFilter}`;
    countIndicator.innerHTML = `Menampilkan <strong>${filtered.length}</strong> data rangkuman (${classLabel})`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  // Urutkan data: yang terbaru di atas
  filtered.sort((a, b) => new Date(b.submittedAt || b.fridayDate) - new Date(a.submittedAt || a.fridayDate));

  tbody.innerHTML = filtered.map((item, index) => {
    const formattedDate = item.fridayDate ? new Date(item.fridayDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }) : "-";

    const statusBadge = item.status === "graded"
      ? `<span class="badge-status graded">✓ Sudah Dinilai</span>`
      : (item.status === "revision"
        ? `<span class="badge-status revision">⚠️ Perlu Revisi</span>`
        : `<span class="badge-status pending">⏳ Menunggu</span>`);

    const scoreDisplay = (item.score !== null && item.score !== undefined)
      ? `<span class="score-pill">${item.score}</span>`
      : `<span class="score-pill empty">-</span>`;

    const photoIndicator = item.photoUrl
      ? `<span title="Ada Foto Bukti" style="color: var(--primary); font-size: 1.1rem; cursor: pointer;">📷</span>`
      : `<span title="Tanpa Foto" style="color: var(--text-light); font-size: 1.1rem;">-</span>`;

    return `
      <tr>
        <td style="text-align: center; color: var(--text-muted); font-weight: 600;">${index + 1}</td>
        <td>
          <strong style="color: var(--text-main); font-size: 0.95rem;">${escapeHtml(item.studentName)}</strong>
          <div style="font-size: 0.78rem; color: var(--text-muted);">NISN: ${escapeHtml(item.nisn || '-')}</div>
        </td>
        <td style="text-align: center;">
          <span style="font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 4px 10px; border-radius: 99px; font-size: 0.8rem;">
            ${escapeHtml(item.className)}
          </span>
        </td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${formattedDate}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(item.mosqueName)}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">Khatib: ${escapeHtml(item.khatibName || '-')}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(item.khutbahTitle)}">
            ${escapeHtml(item.khutbahTitle)}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(item.summaryText.substring(0, 50))}...
          </div>
        </td>
        <td style="text-align: center;">${photoIndicator}</td>
        <td style="text-align: center;">${statusBadge}</td>
        <td style="text-align: center;">${scoreDisplay}</td>
        <td style="text-align: center;">
          <button class="btn btn-primary btn-sm" onclick="openReviewModal('${item.id}')" title="Periksa Tugas & Beri Nilai">
            🔍 Periksa
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * 6. Top Metrics & Class Statistics
 */
function updateTopMetrics() {
  const totalSubmissionsEl = document.getElementById("statTotalSubmissions");
  const totalGradedEl = document.getElementById("statTotalGraded");
  const totalPendingEl = document.getElementById("statTotalPending");
  const avgScoreEl = document.getElementById("statAvgScore");

  const total = AppState.summaries.length;
  const graded = AppState.summaries.filter(s => s.status === "graded").length;
  const pending = AppState.summaries.filter(s => s.status !== "graded").length;

  const scoredItems = AppState.summaries.filter(s => s.score !== null && s.score !== undefined);
  const avg = scoredItems.length > 0
    ? (scoredItems.reduce((acc, curr) => acc + Number(curr.score), 0) / scoredItems.length).toFixed(1)
    : "0";

  if (totalSubmissionsEl) totalSubmissionsEl.textContent = total;
  if (totalGradedEl) totalGradedEl.textContent = graded;
  if (totalPendingEl) totalPendingEl.textContent = pending;
  if (avgScoreEl) avgScoreEl.textContent = avg;
}

function updateClassStatistics() {
  const statsContainer = document.getElementById("classProgressGrid");
  if (!statsContainer) return;

  const targetPerClass = 32; // Standar jumlah siswa per kelas SMA

  statsContainer.innerHTML = AppState.classes.map(cls => {
    const classItems = AppState.summaries.filter(s => s.className === cls);
    const count = classItems.length;
    const percent = Math.min(Math.round((count / targetPerClass) * 100), 100);
    const gradedCount = classItems.filter(s => s.status === "graded").length;

    const scoredClassItems = classItems.filter(s => s.score !== null);
    const avgScore = scoredClassItems.length > 0
      ? (scoredClassItems.reduce((a, b) => a + Number(b.score), 0) / scoredClassItems.length).toFixed(1)
      : "-";

    return `
      <div class="card" style="margin-bottom: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">Kelas ${cls}</h4>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 2px 8px; border-radius: 99px;">
            ${count} / ${targetPerClass} Siswa
          </span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); margin-top: 8px;">
          <span>Tercapai: <strong>${percent}%</strong></span>
          <span>Sudah Dinilai: <strong>${gradedCount}</strong></span>
          <span>Rata-Rata Nilai: <strong style="color: var(--accent-gold);">${avgScore}</strong></span>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * 7. Photo Upload & Preview
 */
function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Harap pilih berkas gambar (JPG, PNG, atau WEBP)", "error");
    return;
  }

  // Limit 5MB
  if (file.size > 5 * 1024 * 1024) {
    showToast("Ukuran foto maksimal 5 MB", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    AppState.activePhotoBase64 = event.target.result;
    renderPhotoPreview();
    showToast("Foto berhasil dimuat", "success");
  };
  reader.readAsDataURL(file);
}

function renderPhotoPreview() {
  const previewContainer = document.getElementById("photoPreviewContainer");
  const uploadPrompt = document.getElementById("photoUploadPrompt");
  const previewImg = document.getElementById("photoPreviewImg");

  if (!previewContainer || !uploadPrompt || !previewImg) return;

  if (AppState.activePhotoBase64) {
    previewImg.src = AppState.activePhotoBase64;
    previewContainer.style.display = "inline-block";
    uploadPrompt.style.display = "none";
  } else {
    previewContainer.style.display = "none";
    uploadPrompt.style.display = "block";
    previewImg.src = "";
  }
}

function removeSelectedPhoto() {
  AppState.activePhotoBase64 = "";
  const fileInput = document.getElementById("inputPhotoFile");
  if (fileInput) fileInput.value = "";
  renderPhotoPreview();
}

/**
 * 8. Form Submission (Siswa Mengirim Rangkuman)
 */
function handleSummarySubmit(e) {
  e.preventDefault();

  const studentName = document.getElementById("inputStudentName").value.trim();
  const nisn = document.getElementById("inputNisn").value.trim();
  const className = document.getElementById("inputClass").value;
  const fridayDate = document.getElementById("inputFridayDate").value;
  const mosqueName = document.getElementById("inputMosqueName").value.trim();
  const mosqueAddress = document.getElementById("inputMosqueAddress").value.trim();
  const khatibName = document.getElementById("inputKhatibName").value.trim();
  const khutbahTitle = document.getElementById("inputKhutbahTitle").value.trim();
  const summaryText = document.getElementById("inputSummaryText").value.trim();
  const quranHadith = document.getElementById("inputQuranHadith").value.trim();
  const moralAction = document.getElementById("inputMoralAction").value.trim();

  // Validasi Wajib
  if (!studentName || !className || !fridayDate || !mosqueName || !khutbahTitle || !summaryText) {
    showToast("Harap lengkapi semua kolom yang bertanda bintang (*)", "warning");
    return;
  }

  if (summaryText.length < 50) {
    showToast("Isi rangkuman khutbah minimal 50 karakter agar bermakna", "warning");
    return;
  }

  // Buat ID unik format JUM-YYYYMMDD-RANDOM
  const cleanDateStr = fridayDate.replace(/-/g, "");
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const summaryId = `JUM-${cleanDateStr}-${randomSuffix}`;

  const newSummary = {
    id: summaryId,
    studentName,
    nisn,
    className,
    fridayDate,
    mosqueName,
    mosqueAddress,
    khatibName,
    khutbahTitle,
    summaryText,
    quranHadith,
    moralAction,
    photoUrl: AppState.activePhotoBase64 || "",
    submittedAt: new Date().toISOString(),
    score: null,
    feedback: "",
    status: "pending"
  };

  // Simpan ke state dan localStorage
  AppState.summaries.unshift(newSummary);
  saveSummaries();

  // Update UI komponen
  renderClassFilterPills();
  populateDateFilterDropdown();
  renderSummariesTable();
  updateTopMetrics();
  updateClassStatistics();

  // Tampilkan Modal Bukti Penerimaan (Digital Receipt)
  showReceiptModal(newSummary);

  // Reset form
  document.getElementById("formSubmitSummary").reset();
  removeSelectedPhoto();
  initFridayDateInput();

  showToast("Alhamdulillah! Rangkuman khutbah Jum'at berhasil dikirim.", "success");
}

/**
 * 9. Digital Receipt Modal (Tanda Terima Siswa)
 */
function showReceiptModal(item) {
  const modal = document.getElementById("receiptModal");
  if (!modal) return;

  const formattedDate = new Date(item.fridayDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const formattedTime = new Date(item.submittedAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  document.getElementById("receiptId").textContent = item.id;
  document.getElementById("receiptStudentName").textContent = item.studentName;
  document.getElementById("receiptClass").textContent = `Kelas ${item.className}`;
  document.getElementById("receiptDate").textContent = `${formattedDate} (${formattedTime} WIB)`;
  document.getElementById("receiptMosque").textContent = item.mosqueName;
  document.getElementById("receiptTitle").textContent = item.khutbahTitle;

  modal.classList.add("active");
}

function closeReceiptModal() {
  const modal = document.getElementById("receiptModal");
  if (modal) modal.classList.remove("active");
}

/**
 * 10. Teacher Review & Grading Modal
 */
function openReviewModal(summaryId) {
  const item = AppState.summaries.find(s => s.id === summaryId);
  if (!item) return;

  AppState.currentViewingSummaryId = summaryId;

  const modal = document.getElementById("reviewModal");
  if (!modal) return;

  document.getElementById("modalStudentName").textContent = item.studentName;
  document.getElementById("modalStudentMeta").textContent = `Kelas ${item.className} • NISN: ${item.nisn || '-'} • ID: ${item.id}`;
  
  const formattedDate = new Date(item.fridayDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  document.getElementById("modalMosqueInfo").textContent = `${item.mosqueName} (${item.mosqueAddress || 'Tanpa Alamat'})`;
  document.getElementById("modalKhatibInfo").textContent = item.khatibName || "Tidak dicantumkan";
  document.getElementById("modalDateInfo").textContent = formattedDate;
  document.getElementById("modalKhutbahTitle").textContent = item.khutbahTitle;
  document.getElementById("modalSummaryText").textContent = item.summaryText;
  document.getElementById("modalQuranHadith").textContent = item.quranHadith || "Tidak ada kutipan ayat / hadits.";
  document.getElementById("modalMoralAction").textContent = item.moralAction || "Tidak ada catatan aksi nyata.";

  // Foto Bukti
  const photoWrapper = document.getElementById("modalPhotoWrapper");
  const photoImg = document.getElementById("modalPhotoImg");
  if (item.photoUrl) {
    photoImg.src = item.photoUrl;
    photoWrapper.style.display = "block";
  } else {
    photoWrapper.style.display = "none";
  }

  // Form Penilaian Guru
  const inputScore = document.getElementById("modalInputScore");
  const inputFeedback = document.getElementById("modalInputFeedback");
  const selectStatus = document.getElementById("modalSelectStatus");

  if (inputScore) inputScore.value = (item.score !== null && item.score !== undefined) ? item.score : "";
  if (inputFeedback) inputFeedback.value = item.feedback || "";
  if (selectStatus) selectStatus.value = item.status || "graded";

  modal.classList.add("active");
}

function closeReviewModal() {
  const modal = document.getElementById("reviewModal");
  if (modal) modal.classList.remove("active");
  AppState.currentViewingSummaryId = null;
}

function saveTeacherGrading() {
  if (!AppState.currentViewingSummaryId) return;

  const itemIndex = AppState.summaries.findIndex(s => s.id === AppState.currentViewingSummaryId);
  if (itemIndex === -1) return;

  const scoreVal = document.getElementById("modalInputScore").value.trim();
  const feedbackVal = document.getElementById("modalInputFeedback").value.trim();
  const statusVal = document.getElementById("modalSelectStatus").value;

  let parsedScore = null;
  if (scoreVal !== "") {
    parsedScore = Number(scoreVal);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      showToast("Nilai harus berupa angka antara 0 sampai 100", "warning");
      return;
    }
  }

  // Update item
  AppState.summaries[itemIndex].score = parsedScore;
  AppState.summaries[itemIndex].feedback = feedbackVal;
  AppState.summaries[itemIndex].status = statusVal;

  saveSummaries();
  closeReviewModal();

  renderSummariesTable();
  updateTopMetrics();
  updateClassStatistics();
  renderClassFilterPills();

  showToast("Penilaian dan catatan guru berhasil disimpan!", "success");
}

function deleteCurrentSummary() {
  if (!AppState.currentViewingSummaryId) return;

  if (confirm("Apakah Anda yakin ingin menghapus laporan tugas rangkuman siswa ini? Tindakan ini tidak dapat dibatalkan.")) {
    AppState.summaries = AppState.summaries.filter(s => s.id !== AppState.currentViewingSummaryId);
    saveSummaries();
    closeReviewModal();

    renderClassFilterPills();
    renderSummariesTable();
    updateTopMetrics();
    updateClassStatistics();

    showToast("Laporan tugas berhasil dihapus.", "info");
  }
}

/**
 * 11. Tab Switching Controller
 */
function switchTab(tabId) {
  // Update buttons
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Update panels
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `tab-${tabId}`);
  });

  // Re-render specific tab contents if needed
  if (tabId === "rekap") {
    renderClassFilterPills();
    renderSummariesTable();
  } else if (tabId === "statistik") {
    updateClassStatistics();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * 12. Toast Notification System
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "warning") icon = "⚠️";
  if (type === "error") icon = "❌";

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideInRight 0.25s ease reverse";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 3500);
}

/**
 * 13. Event Listeners Setup
 */
function setupEventListeners() {
  // Theme Toggle Button
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }

  // Nav Tab Buttons
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Form Submission
  const form = document.getElementById("formSubmitSummary");
  if (form) {
    form.addEventListener("submit", handleSummarySubmit);
  }

  // Photo Input Changes
  const photoInput = document.getElementById("inputPhotoFile");
  if (photoInput) {
    photoInput.addEventListener("change", handlePhotoSelect);
  }

  const removePhotoBtn = document.getElementById("btnRemovePhoto");
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeSelectedPhoto();
    });
  }

  // Summary Text Character Counter
  const summaryTextarea = document.getElementById("inputSummaryText");
  const charCounter = document.getElementById("charCounter");
  if (summaryTextarea && charCounter) {
    summaryTextarea.addEventListener("input", () => {
      const len = summaryTextarea.value.length;
      charCounter.textContent = `${len} karakter (minimal 50)`;
      charCounter.style.color = len >= 50 ? "var(--primary)" : "var(--text-light)";
    });
  }

  // Search Filter
  const searchInput = document.getElementById("tableSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      renderSummariesTable();
    });
  }

  // Date Filter Dropdown
  const filterDateSelect = document.getElementById("filterFridayDate");
  if (filterDateSelect) {
    filterDateSelect.addEventListener("change", (e) => {
      AppState.selectedDateFilter = e.target.value;
      renderSummariesTable();
    });
  }

  // Status Filter Dropdown
  const filterStatusSelect = document.getElementById("filterStatus");
  if (filterStatusSelect) {
    filterStatusSelect.addEventListener("change", (e) => {
      AppState.selectedStatusFilter = e.target.value;
      renderSummariesTable();
    });
  }

  // Export CSV Button
  const btnExportCSV = document.getElementById("btnExportCSV");
  if (btnExportCSV) {
    btnExportCSV.addEventListener("click", () => {
      const filtered = getFilteredSummaries();
      const currentClass = AppState.selectedClassFilter === "all" ? "Semua_Kelas" : AppState.selectedClassFilter;
      const currentDate = AppState.selectedDateFilter === "all" ? "Semua_Tanggal" : AppState.selectedDateFilter;
      ExportUtils.exportToCSV(filtered, currentClass, currentDate);
    });
  }

  // Print Report Button
  const btnPrintReport = document.getElementById("btnPrintReport");
  if (btnPrintReport) {
    btnPrintReport.addEventListener("click", () => {
      const filtered = getFilteredSummaries();
      const currentClass = AppState.selectedClassFilter === "all" ? "Semua Kelas" : `Kelas ${AppState.selectedClassFilter}`;
      const currentDate = AppState.selectedDateFilter === "all" ? "Semua Tanggal" : AppState.selectedDateFilter;
      ExportUtils.printClassReport(filtered, currentClass, currentDate);
    });
  }

  // Modal Review Grading Save Button
  const btnSaveGrading = document.getElementById("btnSaveGrading");
  if (btnSaveGrading) {
    btnSaveGrading.addEventListener("click", saveTeacherGrading);
  }

  // Modal Review Delete Button
  const btnDeleteSummary = document.getElementById("btnDeleteSummary");
  if (btnDeleteSummary) {
    btnDeleteSummary.addEventListener("click", deleteCurrentSummary);
  }

  // Reset Demo Data Button
  const btnResetDemo = document.getElementById("btnResetDemo");
  if (btnResetDemo) {
    btnResetDemo.addEventListener("click", () => {
      if (confirm("Kembalikan data ke contoh awal demo SMA YWKA? Semua perubahan lokal akan direset.")) {
        localStorage.removeItem("khatibku_summaries");
        initData();
        renderClassFilterPills();
        populateDateFilterDropdown();
        renderSummariesTable();
        updateTopMetrics();
        updateClassStatistics();
        showToast("Data demo berhasil dipulihkan.", "success");
      }
    });
  }
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
