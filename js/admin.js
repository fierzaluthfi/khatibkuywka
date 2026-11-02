/**
 * admin.js
 * Logika Portal Master (Guru & Pengawas) - Monitoring, Penilaian Massal (Batch Grading),
 * Input Nilai Cepat & Rekapitulasi Rangkuman Kultum Per Kelas
 */

const AdminApp = {
  summaries: [],
  classes: [],
  selectedClassFilter: "all",
  selectedDateFilter: "all",
  selectedStatusFilter: "all",
  searchQuery: "",
  currentViewingSummaryId: null,
  selectedIds: new Set(),

  async init() {
    this.initTheme();
    this.checkAuth();
    await this.initData();
    this.renderClassFilterPills();
    this.populateDateFilterDropdown();
    this.renderSummariesTable();
    this.updateTopMetrics();
    this.updateClassStatistics();
    this.setupEventListeners();
    this.startAutoSync();
  },

  initTheme() {
    const savedTheme = localStorage.getItem("khatibku_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const btn = document.getElementById("themeToggleBtn");
    if (btn) btn.innerHTML = savedTheme === "dark" ? "☀️ Mode Terang" : "🌙 Mode Gelap";
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("khatibku_theme", next);
    const btn = document.getElementById("themeToggleBtn");
    if (btn) btn.innerHTML = next === "dark" ? "☀️ Mode Terang" : "🌙 Mode Gelap";
  },

  checkAuth() {
    // Cek apakah guru sudah login session ini
    const isAuth = sessionStorage.getItem("khatibku_admin_auth");
    const authModal = document.getElementById("authModal");
    if (!isAuth && authModal) {
      authModal.classList.add("active");
    }
  },

  verifyPin() {
    const pinInput = document.getElementById("inputAdminPin");
    const pinError = document.getElementById("pinError");
    const pin = pinInput ? pinInput.value.trim() : "";

    // Default PIN: "ywka2026" atau "guru123" atau "admin"
    if (pin === "ywka2026" || pin === "guru123" || pin === "admin") {
      sessionStorage.setItem("khatibku_admin_auth", "true");
      const authModal = document.getElementById("authModal");
      if (authModal) authModal.classList.remove("active");
      this.showToast("Selamat datang di Portal Master Guru SMA YWKA", "success");
    } else {
      if (pinError) {
        pinError.textContent = "PIN salah. Gunakan default: ywka2026";
        pinError.style.display = "block";
      }
    }
  },

  async initData() {
    this.updateDbBadgeUI();

    // 1. Baca data lokal dan pastikan sample lama bulan Oktober dibersihkan
    const stored = localStorage.getItem("khatibku_summaries");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.summaries = (parsed || []).filter(item => {
          if (!item || !item.id) return false;
          return !item.id.startsWith("JUM-20261016-") && !item.id.startsWith("JUM-20261009-");
        });
      } catch (e) {
        this.summaries = [];
      }
    } else {
      this.summaries = [];
    }
    localStorage.setItem("khatibku_summaries", JSON.stringify(this.summaries));

    const storedClasses = localStorage.getItem("khatibku_classes");
    if (!storedClasses || storedClasses.includes("X-A") || !storedClasses.includes("X.1")) {
      this.classes = typeof DEFAULT_CLASSES !== "undefined" ? DEFAULT_CLASSES : [
        "X.1", "X.2", "X.3",
        "XI.1", "XI.2", "XI.3",
        "XII.1", "XII.2", "XII.3"
      ];
      localStorage.setItem("khatibku_classes", JSON.stringify(this.classes));
    } else {
      try { this.classes = JSON.parse(storedClasses); } catch (e) { this.classes = DEFAULT_CLASSES; }
    }

    const normalizeClass = (c) => {
      if (!c) return c;
      const map = {
        "X-A": "X.1", "X-B": "X.2", "X-C": "X.3",
        "XI-MIPA 1": "XI.1", "XI-MIPA 2": "XI.2", "XI-IPS 1": "XI.3", "XI-IPS 2": "XI.3",
        "XII-MIPA 1": "XII.1", "XII-MIPA 2": "XII.2", "XII-IPS 1": "XII.3", "XII-IPS 2": "XII.3"
      };
      return map[c] || c;
    };
    this.summaries.forEach(s => { s.className = normalizeClass(s.className); });

    // 2. Jika Supabase aktif, sinkronkan data cloud
    if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
      try {
        const cloudData = await SupabaseConfig.fetchSummaries();
        if (cloudData && Array.isArray(cloudData)) {
          cloudData.forEach(s => { s.className = normalizeClass(s.className); });
          this.summaries = cloudData;
          localStorage.setItem("khatibku_summaries", JSON.stringify(this.summaries));
          this.showToast("Data tersinkronisasi langsung dengan Cloud Supabase", "success");
        }
      } catch (err) {
        console.warn("Offline fallback", err);
      }
    }
  },

  updateDbBadgeUI() {
    const badge = document.getElementById("dbStatusBadge");
    if (badge) {
      if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
        badge.textContent = "🟢 Supabase Cloud";
        badge.style.color = "#86efac";
      } else {
        badge.textContent = "🟡 Lokal (Offline)";
        badge.style.color = "#fef08a";
      }
    }

    const syncStatusText = document.getElementById("syncStatusText");
    if (syncStatusText) {
      if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
        syncStatusText.textContent = "Pemantauan Otomatis Aktif (Supabase Cloud)";
      } else {
        syncStatusText.textContent = "Mode Database Lokal (Offline)";
      }
    }
  },

  updateLastSyncTime() {
    const el = document.getElementById("lastSyncTime");
    if (el) {
      const now = new Date();
      el.textContent = `Terakhir diperbarui: ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
    }
  },

  async refreshData(isSilent = false) {
    if (typeof SupabaseConfig === "undefined" || !SupabaseConfig.isConnected()) {
      this.updateDbBadgeUI();
      return;
    }

    const refreshBtn = document.getElementById("btnRefreshData");
    if (!isSilent && refreshBtn) {
      const icon = refreshBtn.querySelector(".btn-icon-refresh") || refreshBtn;
      icon.classList.add("rotating");
    }

    try {
      const cloudData = await SupabaseConfig.fetchSummaries();
      if (cloudData && Array.isArray(cloudData)) {
        const normalizeClass = (c) => {
          if (!c) return c;
          const map = {
            "X-A": "X.1", "X-B": "X.2", "X-C": "X.3",
            "XI-MIPA 1": "XI.1", "XI-MIPA 2": "XI.2", "XI-IPS 1": "XI.3", "XI-IPS 2": "XI.3",
            "XII-MIPA 1": "XII.1", "XII-MIPA 2": "XII.2", "XII-IPS 1": "XII.3", "XII-IPS 2": "XII.3"
          };
          return map[c] || c;
        };
        cloudData.forEach(s => { s.className = normalizeClass(s.className); });

        const previousIds = new Set(this.summaries.map(s => s.id));
        const newItems = cloudData.filter(item => !previousIds.has(item.id));

        this.summaries = cloudData;
        localStorage.setItem("khatibku_summaries", JSON.stringify(this.summaries));

        // Bersihkan selectedIds yang mungkin sudah terhapus
        const currentIdSet = new Set(this.summaries.map(s => s.id));
        this.selectedIds.forEach(id => {
          if (!currentIdSet.has(id)) this.selectedIds.delete(id);
        });

        this.renderClassFilterPills();
        this.populateDateFilterDropdown();
        this.renderSummariesTable();
        this.updateTopMetrics();
        this.updateClassStatistics();
        this.updateLastSyncTime();

        if (isSilent && newItems.length > 0 && previousIds.size > 0) {
          const first = newItems[0];
          this.showToast(`🔔 Rangkuman baru masuk: ${first.studentName} (Kelas ${first.className})`, "success");
        } else if (!isSilent) {
          this.showToast("Data berhasil diperbarui dari Supabase Cloud!", "success");
        }
      }
    } catch (err) {
      console.warn("Auto sync failed:", err);
    } finally {
      if (!isSilent && refreshBtn) {
        const icon = refreshBtn.querySelector(".btn-icon-refresh") || refreshBtn;
        icon.classList.remove("rotating");
      }
      this.updateDbBadgeUI();
    }
  },

  startAutoSync() {
    this.updateLastSyncTime();

    // 1. Supabase Realtime (Deteksi perubahan data langsung)
    if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
      SupabaseConfig.subscribeToSummaries((payload) => {
        console.log("Supabase Realtime event diterima:", payload);
        this.refreshData(true);
      });
    }

    // 2. Interval background sync (Auto-refresh setiap 15 detik)
    if (this._syncInterval) clearInterval(this._syncInterval);
    this._syncInterval = setInterval(() => {
      this.refreshData(true);
    }, 15000);
  },

  renderClassFilterPills() {
    const container = document.getElementById("classPillsContainer");
    if (!container) return;

    container.innerHTML = "";

    // Pill Semua Kelas
    const allPill = document.createElement("button");
    allPill.className = `class-pill ${this.selectedClassFilter === 'all' ? 'active' : ''}`;
    allPill.innerHTML = `Semua Kelas <span class="pill-count">${this.summaries.length}</span>`;
    allPill.addEventListener("click", () => {
      this.selectedClassFilter = "all";
      this.renderClassFilterPills();
      this.renderSummariesTable();
    });
    container.appendChild(allPill);

    // Pill per Kelas
    this.classes.forEach(cls => {
      const count = this.summaries.filter(s => s.className === cls).length;
      const pill = document.createElement("button");
      pill.className = `class-pill ${this.selectedClassFilter === cls ? 'active' : ''}`;
      pill.innerHTML = `Kelas ${cls} <span class="pill-count">${count}</span>`;
      pill.addEventListener("click", () => {
        this.selectedClassFilter = cls;
        this.renderClassFilterPills();
        this.renderSummariesTable();
      });
      container.appendChild(pill);
    });
  },

  populateDateFilterDropdown() {
    const select = document.getElementById("filterFridayDate");
    if (!select) return;

    const dates = [...new Set(this.summaries.map(s => s.fridayDate))].filter(Boolean);
    dates.sort((a, b) => new Date(b) - new Date(a));

    const currentVal = this.selectedDateFilter;
    select.innerHTML = '<option value="all">📅 Semua Tanggal Kultum</option>';
    dates.forEach(d => {
      const formatted = new Date(d).toLocaleDateString("id-ID", {
        weekday: "short", day: "numeric", month: "short", year: "numeric"
      });
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = formatted;
      select.appendChild(opt);
    });

    if (dates.includes(currentVal)) {
      select.value = currentVal;
    } else {
      select.value = "all";
      this.selectedDateFilter = "all";
    }
  },

  getFilteredSummaries() {
    return this.summaries.filter(item => {
      if (this.selectedClassFilter !== "all" && item.className !== this.selectedClassFilter) return false;
      if (this.selectedDateFilter !== "all" && item.fridayDate !== this.selectedDateFilter) return false;
      if (this.selectedStatusFilter !== "all" && item.status !== this.selectedStatusFilter) return false;

      if (this.searchQuery.trim() !== "") {
        const q = this.searchQuery.toLowerCase();
        const mName = item.studentName && item.studentName.toLowerCase().includes(q);
        const mNisn = item.nisn && item.nisn.toLowerCase().includes(q);
        const mTitle = item.khutbahTitle && item.khutbahTitle.toLowerCase().includes(q);
        const mMosque = item.mosqueName && item.mosqueName.toLowerCase().includes(q);
        const mKhatib = item.khatibName && item.khatibName.toLowerCase().includes(q);
        if (!mName && !mNisn && !mTitle && !mMosque && !mKhatib) return false;
      }
      return true;
    });
  },

  // =========================================================================
  // SISTEM BATCH SELECTION & ACTION BAR
  // =========================================================================
  toggleRowSelection(id, isChecked) {
    if (isChecked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }

    const tr = document.querySelector(`tr[data-row-id="${id}"]`);
    if (tr) tr.classList.toggle("row-selected", isChecked);

    this.updateBatchSelectionUI();
  },

  toggleSelectAll(isChecked) {
    const filtered = this.getFilteredSummaries();
    if (isChecked) {
      filtered.forEach(s => this.selectedIds.add(s.id));
    } else {
      filtered.forEach(s => this.selectedIds.delete(s.id));
    }
    this.renderSummariesTable();
  },

  selectPendingOnly() {
    const filtered = this.getFilteredSummaries();
    const pendingItems = filtered.filter(s => s.status !== "graded" || s.score === null || s.score === undefined || s.score === "");

    if (pendingItems.length === 0) {
      this.showToast("Semua siswa pada filter saat ini sudah selesai dinilai!", "info");
      return;
    }

    this.selectedIds.clear();
    pendingItems.forEach(s => this.selectedIds.add(s.id));
    this.renderSummariesTable();
    this.showToast(`Berhasil memilih ${pendingItems.length} siswa yang belum dinilai.`, "success");
  },

  clearSelection() {
    this.selectedIds.clear();
    this.renderSummariesTable();
  },

  updateBatchSelectionUI() {
    const count = this.selectedIds.size;
    const badgeCount = document.getElementById("batchBtnCount");
    const countText = document.getElementById("batchSelectionCountText");
    const btnOpenBatch = document.getElementById("btnOpenBatchModal");
    const btnClear = document.getElementById("btnClearSelection");
    const headerCheckbox = document.getElementById("tableHeaderCheckbox");

    if (badgeCount) badgeCount.textContent = count;
    if (countText) {
      countText.innerHTML = count > 0 
        ? `<strong>${count}</strong> data terpilih` 
        : `<strong>0</strong> terpilih`;
    }
    if (btnOpenBatch) {
      btnOpenBatch.disabled = count === 0;
    }
    if (btnClear) {
      btnClear.style.display = count > 0 ? "inline-flex" : "none";
    }

    const filtered = this.getFilteredSummaries();
    if (headerCheckbox) {
      if (filtered.length > 0 && filtered.every(s => this.selectedIds.has(s.id))) {
        headerCheckbox.checked = true;
        headerCheckbox.indeterminate = false;
      } else if (count > 0 && filtered.some(s => this.selectedIds.has(s.id))) {
        headerCheckbox.checked = false;
        headerCheckbox.indeterminate = true;
      } else {
        headerCheckbox.checked = false;
        headerCheckbox.indeterminate = false;
      }
    }
  },

  // =========================================================================
  // INPUT NILAI CEPAT (INLINE GRADING SEPERTI SPREADSHEET)
  // =========================================================================
  quickSaveScore(id, rawVal, inputEl) {
    const trimmed = String(rawVal).trim();
    let parsedScore = null;

    if (trimmed !== "") {
      parsedScore = Number(trimmed);
      if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
        this.showToast("Nilai harus berupa angka 0 - 100", "warning");
        if (inputEl) {
          const item = this.summaries.find(s => s.id === id);
          inputEl.value = (item && item.score !== null) ? item.score : "";
        }
        return;
      }
    }

    const item = this.summaries.find(s => s.id === id);
    if (!item) return;

    // Jangan kirim request jika tidak ada perubahan nilai
    if (item.score === parsedScore && ((parsedScore !== null && item.status === "graded") || (parsedScore === null && item.status === "pending"))) {
      return;
    }

    item.score = parsedScore;
    item.status = parsedScore !== null ? "graded" : "pending";
    localStorage.setItem("khatibku_summaries", JSON.stringify(this.summaries));

    if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
      SupabaseConfig.updateSummary(id, {
        score: parsedScore,
        status: item.status
      });
    }

    if (inputEl) {
      inputEl.classList.add("saved-highlight");
      setTimeout(() => inputEl.classList.remove("saved-highlight"), 1000);
    }

    // Perbarui badge status pada baris yang bersangkutan tanpa re-render penuh
    const tr = document.querySelector(`tr[data-row-id="${id}"]`);
    if (tr) {
      const statusTd = tr.querySelector(".cell-status");
      if (statusTd) {
        statusTd.innerHTML = item.status === "graded"
          ? `<span class="badge-status graded">✓ Sudah Dinilai</span>`
          : `<span class="badge-status pending">⏳ Menunggu</span>`;
      }
    }

    this.updateTopMetrics();
    this.updateClassStatistics();
    this.renderClassFilterPills();
    this.showToast(`Nilai ${item.studentName} berhasil disimpan: ${parsedScore ?? 'Dikosongkan'}`, "success");
  },

  // =========================================================================
  // MODAL PENILAIAN MASSAL (BATCH GRADING)
  // =========================================================================
  openBatchGradingModal() {
    if (this.selectedIds.size === 0) {
      this.showToast("Centang minimal satu siswa untuk dinilai secara massal.", "warning");
      return;
    }

    const modal = document.getElementById("batchGradingModal");
    const countEl = document.getElementById("batchModalCount");
    const namesList = document.getElementById("batchSelectedNamesList");

    if (countEl) countEl.textContent = this.selectedIds.size;

    if (namesList) {
      const selectedItems = this.summaries.filter(s => this.selectedIds.has(s.id));
      namesList.innerHTML = selectedItems.map(s => `
        <span style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 3px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 600;">
          ${escapeHtml(s.studentName)} (${escapeHtml(s.className)})
        </span>
      `).join("");
    }

    const scoreInput = document.getElementById("batchInputScore");
    if (scoreInput) scoreInput.value = "";

    const feedbackInput = document.getElementById("batchInputFeedback");
    if (feedbackInput) feedbackInput.value = "";

    if (modal) modal.classList.add("active");
  },

  closeBatchGradingModal() {
    const modal = document.getElementById("batchGradingModal");
    if (modal) modal.classList.remove("active");
  },

  setBatchScorePreset(val) {
    const input = document.getElementById("batchInputScore");
    if (input) {
      input.value = val;
      input.focus();
    }
  },

  setBatchFeedbackPreset(text) {
    const input = document.getElementById("batchInputFeedback");
    if (input) {
      input.value = text;
      input.focus();
    }
  },

  async executeBatchGrading() {
    if (this.selectedIds.size === 0) return;

    const scoreInput = document.getElementById("batchInputScore");
    const feedbackInput = document.getElementById("batchInputFeedback");
    const statusSelect = document.getElementById("batchSelectStatus");

    const scoreVal = scoreInput ? scoreInput.value.trim() : "";
    const feedbackVal = feedbackInput ? feedbackInput.value.trim() : "";
    const statusVal = statusSelect ? statusSelect.value : "graded";

    let parsedScore = null;
    if (scoreVal !== "") {
      parsedScore = Number(scoreVal);
      if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
        this.showToast("Nilai harus berupa angka 0 - 100", "warning");
        if (scoreInput) scoreInput.focus();
        return;
      }
    }

    const btnApply = document.getElementById("btnApplyBatchGrading");
    if (btnApply) {
      btnApply.disabled = true;
      btnApply.textContent = "⏳ Menyimpan ke Cloud...";
    }

    const ids = Array.from(this.selectedIds);
    const updates = { status: statusVal };
    if (parsedScore !== null) updates.score = parsedScore;
    if (feedbackVal !== "") updates.feedback = feedbackVal;

    // 1. Update in-memory & LocalStorage
    this.summaries.forEach(s => {
      if (this.selectedIds.has(s.id)) {
        if (parsedScore !== null) s.score = parsedScore;
        if (feedbackVal !== "") s.feedback = feedbackVal;
        s.status = statusVal;
      }
    });
    localStorage.setItem("khatibku_summaries", JSON.stringify(this.summaries));

    // 2. Batch update ke Supabase Cloud
    if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
      try {
        await SupabaseConfig.batchUpdateSummaries(ids, updates);
      } catch (err) {
        console.warn("Gagal update batch ke Supabase:", err);
      }
    }

    if (btnApply) {
      btnApply.disabled = false;
      btnApply.textContent = "💾 Terapkan & Simpan Nilai";
    }

    this.closeBatchGradingModal();
    this.clearSelection();
    this.renderSummariesTable();
    this.updateTopMetrics();
    this.updateClassStatistics();
    this.renderClassFilterPills();
    this.showToast(`Berhasil menerapkan nilai untuk ${ids.length} siswa secara serentak!`, "success");
  },

  // =========================================================================
  // TABEL UTAMA & MODAL DETAIL PERIKSA SISWA
  // =========================================================================
  renderSummariesTable() {
    const tbody = document.getElementById("summariesTableBody");
    const emptyState = document.getElementById("emptyStateTable");
    const counter = document.getElementById("filteredResultCount");
    if (!tbody) return;

    const filtered = this.getFilteredSummaries();

    if (counter) {
      const clsName = this.selectedClassFilter === 'all' ? 'Semua Kelas' : `Kelas ${this.selectedClassFilter}`;
      counter.innerHTML = `Menampilkan <strong>${filtered.length}</strong> data rangkuman (<strong>${clsName}</strong>)`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      this.updateBatchSelectionUI();
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    filtered.sort((a, b) => new Date(b.submittedAt || b.fridayDate) - new Date(a.submittedAt || a.fridayDate));

    tbody.innerHTML = filtered.map((item, index) => {
      const isSelected = this.selectedIds.has(item.id);
      const formattedDate = item.fridayDate ? new Date(item.fridayDate).toLocaleDateString("id-ID", {
        day: "numeric", month: "short", year: "numeric"
      }) : "-";

      const statusBadge = item.status === "graded"
        ? `<span class="badge-status graded">✓ Sudah Dinilai</span>`
        : `<span class="badge-status pending">⏳ Menunggu</span>`;

      const scoreVal = (item.score !== null && item.score !== undefined) ? item.score : "";
      const hasPhoto = !!item.photoUrl || !!item.hasPhoto;
      const photoIcon = hasPhoto
        ? `<span onclick="AdminApp.openReviewModal('${escapeHtml(item.id)}')" title="Ada Foto Bukti Dokumentasi (Klik untuk Melihat)" style="color: var(--ywka-blue); font-size: 1.15rem; cursor: pointer;">📷</span>`
        : `<span title="Tanpa Foto" style="color: var(--text-light);">-</span>`;

      return `
        <tr data-row-id="${escapeHtml(item.id)}" class="${isSelected ? 'row-selected' : ''}">
          <td style="text-align: center;">
            <input type="checkbox" class="row-checkbox" data-id="${escapeHtml(item.id)}" ${isSelected ? 'checked' : ''} onchange="AdminApp.toggleRowSelection('${escapeHtml(item.id)}', this.checked)" title="Pilih siswa ini" style="width: 17px; height: 17px; cursor: pointer;">
          </td>
          <td style="text-align: center; color: var(--text-muted); font-weight: 700;">${index + 1}</td>
          <td>
            <strong style="color: var(--text-main); font-size: 0.95rem;">${escapeHtml(item.studentName)}</strong>
            <div style="font-size: 0.78rem; color: var(--text-muted);">NISN: ${escapeHtml(item.nisn || '-')}</div>
          </td>
          <td style="text-align: center;">
            <span style="font-weight: 800; color: var(--ywka-blue); background: var(--ywka-blue-light); padding: 4px 10px; border-radius: 99px; font-size: 0.8rem; border: 1px solid var(--ywka-blue-border);">
              ${escapeHtml(item.className)}
            </span>
          </td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">${formattedDate}</td>
          <td>
            <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(item.mosqueName)}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Penceramah: ${escapeHtml(item.khatibName || '-')}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(item.khutbahTitle)}">
              ${escapeHtml(item.khutbahTitle)}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${escapeHtml((item.summaryText || "").substring(0, 50))}...
            </div>
          </td>
          <td style="text-align: center;">${photoIcon}</td>
          <td class="cell-status" style="text-align: center;">${statusBadge}</td>
          <td style="text-align: center;">
            <input type="number" min="0" max="100" class="inline-score-input" value="${scoreVal}" placeholder="-" title="Ketik angka nilai lalu Enter untuk simpan langsung" onchange="AdminApp.quickSaveScore('${escapeHtml(item.id)}', this.value, this)" onkeydown="if(event.key==='Enter'){this.blur();}">
          </td>
          <td style="text-align: center;">
            <button class="btn btn-primary btn-sm" onclick="AdminApp.openReviewModal('${escapeHtml(item.id)}')" title="Periksa Tugas & Catatan Detail">
              🔍 Periksa
            </button>
          </td>
        </tr>
      `;
    }).join("");

    this.updateBatchSelectionUI();
  },

  updateTopMetrics() {
    const totalEl = document.getElementById("statTotalSubmissions");
    const gradedEl = document.getElementById("statTotalGraded");
    const avgEl = document.getElementById("statAvgScore");

    const total = this.summaries.length;
    const graded = this.summaries.filter(s => s.status === "graded").length;
    const scored = this.summaries.filter(s => s.score !== null && s.score !== undefined && s.score !== "");
    const avg = scored.length > 0
      ? (scored.reduce((a, b) => a + Number(b.score), 0) / scored.length).toFixed(1)
      : "0.0";

    if (totalEl) totalEl.textContent = total;
    if (gradedEl) gradedEl.textContent = graded;
    if (avgEl) avgEl.textContent = avg;
  },

  updateClassStatistics() {
    const container = document.getElementById("classProgressGrid");
    if (!container) return;

    const targetPerClass = 32;

    container.innerHTML = this.classes.map(cls => {
      const items = this.summaries.filter(s => s.className === cls);
      const count = items.length;
      const pct = Math.min(Math.round((count / targetPerClass) * 100), 100);
      const gradedCount = items.filter(s => s.status === "graded").length;
      const scoredItems = items.filter(s => s.score !== null && s.score !== undefined && s.score !== "");
      const avg = scoredItems.length > 0
        ? (scoredItems.reduce((a, b) => a + Number(b.score), 0) / scoredItems.length).toFixed(1)
        : "-";

      return `
        <div class="card" style="margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--ywka-blue);">Kelas ${cls}</h4>
            <span style="font-size: 0.8rem; font-weight: 800; color: var(--ywka-orange); background: var(--ywka-orange-light); padding: 2px 8px; border-radius: 99px;">
              ${count} / ${targetPerClass} Siswa
            </span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); margin-top: 8px;">
            <span>Tercapai: <strong>${pct}%</strong></span>
            <span>Dinilai: <strong>${gradedCount}</strong></span>
            <span>Rata-Rata: <strong style="color: var(--ywka-orange); font-size: 0.9rem;">${avg}</strong></span>
          </div>
        </div>
      `;
    }).join("");
  },

  openReviewModal(id) {
    const item = this.summaries.find(s => s.id === id);
    if (!item) return;

    this.currentViewingSummaryId = id;
    const modal = document.getElementById("reviewModal");
    if (!modal) return;

    document.getElementById("modalStudentName").textContent = item.studentName;
    document.getElementById("modalStudentMeta").textContent = `Kelas ${item.className} • NISN: ${item.nisn || '-'} • ID: ${item.id}`;

    const formattedDate = new Date(item.fridayDate).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    document.getElementById("modalMosqueInfo").textContent = `${item.mosqueName} (${item.mosqueAddress || 'Tanpa Alamat'})`;
    document.getElementById("modalDateInfo").textContent = formattedDate;
    document.getElementById("modalKhatibInfo").textContent = item.khatibName || "Tidak dicantumkan";
    document.getElementById("modalKhutbahTitle").textContent = item.khutbahTitle;
    document.getElementById("modalSummaryText").textContent = item.summaryText;
    document.getElementById("modalQuranHadith").textContent = item.quranHadith || "Tidak ada kutipan ayat / hadits.";
    document.getElementById("modalMoralAction").textContent = item.moralAction || "Tidak ada catatan aksi nyata.";

    const photoWrapper = document.getElementById("modalPhotoWrapper");
    const photoImg = document.getElementById("modalPhotoImg");
    if (item.photoUrl) {
      photoImg.src = item.photoUrl;
      photoWrapper.style.display = "block";
    } else if (item.hasPhoto) {
      photoWrapper.style.display = "block";
      photoImg.src = "";
      photoImg.alt = "Memuat foto bukti dokumentasi...";
      if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
        SupabaseConfig.fetchSummaryPhoto(item.id).then(url => {
          if (url) {
            item.photoUrl = url;
            if (this.currentViewingSummaryId === item.id) {
              photoImg.src = url;
              photoImg.alt = "Foto Bukti Siswa";
            }
          } else {
            if (this.currentViewingSummaryId === item.id) {
              photoWrapper.style.display = "none";
            }
          }
        });
      }
    } else {
      photoWrapper.style.display = "none";
    }

    document.getElementById("modalInputScore").value = (item.score !== null && item.score !== undefined) ? item.score : "";
    document.getElementById("modalInputFeedback").value = item.feedback || "";
    document.getElementById("modalSelectStatus").value = item.status || "graded";

    modal.classList.add("active");
  },

  closeReviewModal() {
    const modal = document.getElementById("reviewModal");
    if (modal) modal.classList.remove("active");
    this.currentViewingSummaryId = null;
  },

  saveTeacherGrading() {
    if (!this.currentViewingSummaryId) return;

    const idx = this.summaries.findIndex(s => s.id === this.currentViewingSummaryId);
    if (idx === -1) return;

    const scoreVal = document.getElementById("modalInputScore").value.trim();
    const feedbackVal = document.getElementById("modalInputFeedback").value.trim();
    const statusVal = document.getElementById("modalSelectStatus").value;

    let parsedScore = null;
    if (scoreVal !== "") {
      parsedScore = Number(scoreVal);
      if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
        this.showToast("Nilai harus angka 0 - 100", "warning");
        return;
      }
    }

    this.summaries[idx].score = parsedScore;
    this.summaries[idx].feedback = feedbackVal;
    this.summaries[idx].status = statusVal;

    localStorage.setItem("khatibku_summaries", JSON.stringify(this.summaries));

    if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
      SupabaseConfig.updateSummary(this.currentViewingSummaryId, {
        score: parsedScore, feedback: feedbackVal, status: statusVal
      });
    }

    this.closeReviewModal();
    this.renderSummariesTable();
    this.updateTopMetrics();
    this.updateClassStatistics();
    this.renderClassFilterPills();
    this.showToast("Nilai dan catatan berhasil disimpan!", "success");
  },

  deleteCurrentSummary() {
    if (!this.currentViewingSummaryId) return;

    if (confirm("Apakah Anda yakin ingin menghapus data laporan siswa ini?")) {
      const delId = this.currentViewingSummaryId;
      this.selectedIds.delete(delId);
      this.summaries = this.summaries.filter(s => s.id !== delId);
      localStorage.setItem("khatibku_summaries", JSON.stringify(this.summaries));

      if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
        SupabaseConfig.deleteSummary(delId);
      }

      this.closeReviewModal();
      this.renderClassFilterPills();
      this.renderSummariesTable();
      this.updateTopMetrics();
      this.updateClassStatistics();
      this.showToast("Laporan tugas berhasil dihapus.", "info");
    }
  },

  switchTab(tabId) {
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".tab-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `tab-${tabId}`);
    });
    if (tabId === "statistik") {
      this.updateClassStatistics();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideInRight 0.25s ease reverse";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3500);
  },

  // Modal Supabase
  openDbModal() {
    const modal = document.getElementById("dbModal");
    if (!modal) return;
    const creds = SupabaseConfig.getCredentials();
    document.getElementById("inputSupabaseUrl").value = creds.url || "";
    document.getElementById("inputSupabaseKey").value = creds.key || "";
    document.getElementById("dbTestStatus").style.display = "none";
    modal.classList.add("active");
  },

  closeDbModal() {
    const modal = document.getElementById("dbModal");
    if (modal) modal.classList.remove("active");
  },

  async saveDbConfig() {
    const url = document.getElementById("inputSupabaseUrl").value.trim();
    const key = document.getElementById("inputSupabaseKey").value.trim();
    const statusDiv = document.getElementById("dbTestStatus");

    if (!url || !key) {
      statusDiv.style.display = "block";
      statusDiv.style.background = "#fee2e2";
      statusDiv.style.color = "#991b1b";
      statusDiv.textContent = "Harap isi Project URL dan Anon Key.";
      return;
    }

    SupabaseConfig.saveCredentials(url, key);
    this.updateDbBadgeUI();

    statusDiv.style.display = "block";
    statusDiv.style.background = "#fef3c7";
    statusDiv.style.color = "#92400e";
    statusDiv.textContent = "Menguji koneksi ke Supabase Cloud...";

    const cloudData = await SupabaseConfig.fetchSummaries();
    if (cloudData !== null) {
      statusDiv.style.background = "#d1fae5";
      statusDiv.style.color = "#065f46";
      statusDiv.textContent = `✅ Berhasil terhubung! Ada ${cloudData.length} data di Supabase.`;
      if (cloudData.length > 0) {
        this.summaries = cloudData;
        localStorage.setItem("khatibku_summaries", JSON.stringify(this.summaries));
        this.renderClassFilterPills();
        this.populateDateFilterDropdown();
        this.renderSummariesTable();
        this.updateTopMetrics();
        this.updateClassStatistics();
      }
      setTimeout(() => {
        this.closeDbModal();
        this.showToast("Database Supabase Cloud berhasil terhubung!", "success");
      }, 1200);
    } else {
      statusDiv.style.background = "#fee2e2";
      statusDiv.style.color = "#991b1b";
      statusDiv.innerHTML = "⚠️ Gagal terhubung. Pastikan URL & Key tepat dan tabel <code>friday_summaries</code> sudah dibuat.";
    }
  },

  disconnectSupabase() {
    SupabaseConfig.saveCredentials("", "");
    this.updateDbBadgeUI();
    this.closeDbModal();
    this.showToast("Mode beralih ke Database Lokal.", "info");
  },

  setupEventListeners() {
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) themeBtn.addEventListener("click", () => this.toggleTheme());

    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    const searchInput = document.getElementById("tableSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.renderSummariesTable();
      });
    }

    const filterDate = document.getElementById("filterFridayDate");
    if (filterDate) {
      filterDate.addEventListener("change", (e) => {
        this.selectedDateFilter = e.target.value;
        this.renderSummariesTable();
      });
    }

    const filterStatus = document.getElementById("filterStatus");
    if (filterStatus) {
      filterStatus.addEventListener("change", (e) => {
        this.selectedStatusFilter = e.target.value;
        this.renderSummariesTable();
      });
    }

    // Export CSV
    const btnCSV = document.getElementById("btnExportCSV");
    if (btnCSV) {
      btnCSV.addEventListener("click", () => {
        const filtered = this.getFilteredSummaries();
        const cls = this.selectedClassFilter === "all" ? "Semua_Kelas" : this.selectedClassFilter;
        const d = this.selectedDateFilter === "all" ? "Semua_Tanggal" : this.selectedDateFilter;
        ExportUtils.exportToCSV(filtered, cls, d);
      });
    }

    // Print Report
    const btnPrint = document.getElementById("btnPrintReport");
    if (btnPrint) {
      btnPrint.addEventListener("click", () => {
        const filtered = this.getFilteredSummaries();
        const cls = this.selectedClassFilter === "all" ? "Semua Kelas" : `Kelas ${this.selectedClassFilter}`;
        const d = this.selectedDateFilter === "all" ? "Semua Tanggal" : this.selectedDateFilter;
        ExportUtils.printClassReport(filtered, cls, d);
      });
    }

    const btnSaveGrade = document.getElementById("btnSaveGrading");
    if (btnSaveGrade) btnSaveGrade.addEventListener("click", () => this.saveTeacherGrading());

    const btnDel = document.getElementById("btnDeleteSummary");
    if (btnDel) btnDel.addEventListener("click", () => this.deleteCurrentSummary());

    const btnRefresh = document.getElementById("btnRefreshData");
    if (btnRefresh) btnRefresh.addEventListener("click", () => this.refreshData(false));

    const btnOpenDb = document.getElementById("btnOpenDbModal");
    if (btnOpenDb) btnOpenDb.addEventListener("click", () => this.openDbModal());

    const btnSaveDb = document.getElementById("btnSaveDbConfig");
    if (btnSaveDb) btnSaveDb.addEventListener("click", () => this.saveDbConfig());

    const btnPinSubmit = document.getElementById("btnSubmitPin");
    if (btnPinSubmit) btnPinSubmit.addEventListener("click", () => this.verifyPin());

    const pinInput = document.getElementById("inputAdminPin");
    if (pinInput) {
      pinInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.verifyPin();
      });
    }
  }
};

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", () => AdminApp.init());
