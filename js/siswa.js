/**
 * siswa.js
 * Logika khusus Portal Siswa untuk pengisian dan pengiriman rangkuman khutbah Jum'at
 */

const SiswaApp = {
  activePhotoBase64: "",
  classes: [],

  init() {
    this.initTheme();
    this.initClasses();
    this.initFridayDate();
    this.setupEventListeners();
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

  initClasses() {
    const stored = localStorage.getItem("khatibku_classes");
    if (stored) {
      try { this.classes = JSON.parse(stored); } catch (e) { this.classes = DEFAULT_CLASSES; }
    } else {
      this.classes = typeof DEFAULT_CLASSES !== "undefined" ? DEFAULT_CLASSES : [
        "X-A", "X-B", "X-C",
        "XI-MIPA 1", "XI-MIPA 2", "XI-IPS 1", "XI-IPS 2",
        "XII-MIPA 1", "XII-MIPA 2", "XII-IPS 1", "XII-IPS 2"
      ];
    }

    const select = document.getElementById("inputClass");
    if (select) {
      select.innerHTML = '<option value="">-- Pilih Kelas Anda --</option>';
      this.classes.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = `Kelas ${c}`;
        select.appendChild(opt);
      });
    }
  },

  initFridayDate() {
    const dateInput = document.getElementById("inputFridayDate");
    if (dateInput) {
      const d = new Date();
      const day = d.getDay();
      const diff = day >= 5 ? day - 5 : day + 2;
      const target = new Date(d.getTime() - (diff * 24 * 60 * 60 * 1000));
      dateInput.value = target.toISOString().split("T")[0];
    }
  },

  handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.showToast("Harap pilih berkas gambar (JPG, PNG, WEBP)", "warning");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showToast("Ukuran foto maksimal 5 MB", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      this.activePhotoBase64 = event.target.result;
      const previewWrapper = document.getElementById("photoPreviewContainer");
      const promptWrapper = document.getElementById("photoUploadPrompt");
      const img = document.getElementById("photoPreviewImg");

      if (img && previewWrapper && promptWrapper) {
        img.src = this.activePhotoBase64;
        previewWrapper.style.display = "inline-block";
        promptWrapper.style.display = "none";
        this.showToast("Foto berhasil dimuat", "success");
      }
    };
    reader.readAsDataURL(file);
  },

  removePhoto() {
    this.activePhotoBase64 = "";
    const fileInput = document.getElementById("inputPhotoFile");
    if (fileInput) fileInput.value = "";
    const previewWrapper = document.getElementById("photoPreviewContainer");
    const promptWrapper = document.getElementById("photoUploadPrompt");
    if (previewWrapper) previewWrapper.style.display = "none";
    if (promptWrapper) promptWrapper.style.display = "block";
  },

  async handleSubmit(e) {
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

    if (!studentName || !className || !fridayDate || !mosqueName || !khutbahTitle || !summaryText) {
      this.showToast("Harap lengkapi semua kolom wajib (*)", "warning");
      return;
    }

    if (summaryText.length < 50) {
      this.showToast("Isi rangkuman minimal 50 karakter agar bermakna", "warning");
      return;
    }

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
      photoUrl: this.activePhotoBase64 || "",
      submittedAt: new Date().toISOString(),
      score: null,
      feedback: "",
      status: "pending"
    };

    // 1. Simpan ke Local Storage
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem("khatibku_summaries")) || [];
    } catch (err) {
      list = [];
    }
    list.unshift(newSummary);
    localStorage.setItem("khatibku_summaries", JSON.stringify(list));

    // 2. Simpan ke Cloud Supabase (jika terhubung)
    if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
      SupabaseConfig.insertSummary(newSummary).then(ok => {
        if (ok) {
          this.showToast("Tersimpan di Cloud Database Sekolah!", "success");
        }
      });
    }

    // Tampilkan Tanda Terima Resmi
    this.showReceipt(newSummary);

    // Reset Form
    document.getElementById("formSubmitSummary").reset();
    this.removePhoto();
    this.initFridayDate();
    this.showToast("Alhamdulillah! Rangkuman khutbah berhasil terkirim.", "success");
  },

  showReceipt(item) {
    const modal = document.getElementById("receiptModal");
    if (!modal) return;

    const formattedDate = new Date(item.fridayDate).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    document.getElementById("receiptId").textContent = item.id;
    document.getElementById("receiptStudentName").textContent = item.studentName;
    document.getElementById("receiptClass").textContent = `Kelas ${item.className}`;
    document.getElementById("receiptDate").textContent = formattedDate;
    document.getElementById("receiptMosque").textContent = item.mosqueName;
    document.getElementById("receiptTitle").textContent = item.khutbahTitle;

    modal.classList.add("active");
  },

  closeReceipt() {
    const modal = document.getElementById("receiptModal");
    if (modal) modal.classList.remove("active");
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

  switchTab(tabId) {
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".tab-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `tab-${tabId}`);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  setupEventListeners() {
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) themeBtn.addEventListener("click", () => this.toggleTheme());

    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    const form = document.getElementById("formSubmitSummary");
    if (form) form.addEventListener("submit", (e) => this.handleSubmit(e));

    const photoInput = document.getElementById("inputPhotoFile");
    if (photoInput) photoInput.addEventListener("change", (e) => this.handlePhotoSelect(e));

    const removeBtn = document.getElementById("btnRemovePhoto");
    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removePhoto();
      });
    }

    const textarea = document.getElementById("inputSummaryText");
    const counter = document.getElementById("charCounter");
    if (textarea && counter) {
      textarea.addEventListener("input", () => {
        const len = textarea.value.length;
        counter.textContent = `${len} karakter (minimal 50)`;
        counter.style.color = len >= 50 ? "var(--ywka-green)" : "var(--text-light)";
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

document.addEventListener("DOMContentLoaded", () => SiswaApp.init());
