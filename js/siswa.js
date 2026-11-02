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
    if (!stored || stored.includes("X-A") || !stored.includes("X.1")) {
      this.classes = typeof DEFAULT_CLASSES !== "undefined" ? DEFAULT_CLASSES : [
        "X.1", "X.2", "X.3",
        "XI.1", "XI.2", "XI.3",
        "XII.1", "XII.2", "XII.3"
      ];
      localStorage.setItem("khatibku_classes", JSON.stringify(this.classes));
    } else {
      try { this.classes = JSON.parse(stored); } catch (e) { this.classes = DEFAULT_CLASSES; }
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

    if (file.size > 10 * 1024 * 1024) {
      this.showToast("Ukuran foto maksimal 10 MB", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Kompresi dan resize foto secara client-side agar ringan (sekitar 50-80 KB)
        const canvas = document.createElement("canvas");
        const MAX_DIM = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Kualitas JPEG 0.72 sangat jernih namun ukuran file berkurang >95%
        this.activePhotoBase64 = canvas.toDataURL("image/jpeg", 0.72);

        const previewWrapper = document.getElementById("photoPreviewContainer");
        const promptWrapper = document.getElementById("photoUploadPrompt");
        const previewImg = document.getElementById("photoPreviewImg");

        if (previewImg && previewWrapper && promptWrapper) {
          previewImg.src = this.activePhotoBase64;
          previewWrapper.style.display = "inline-block";
          promptWrapper.style.display = "none";
          this.showToast("Foto berhasil dimuat & dioptimalkan", "success");
        }
      };
      img.onerror = () => {
        this.showToast("Gagal memproses gambar", "warning");
      };
      img.src = event.target.result;
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
    const className = document.getElementById("inputClass").value;
    const fridayDate = document.getElementById("inputFridayDate").value;
    const mosqueName = document.getElementById("inputMosqueName").value.trim();
    const mosqueAddress = document.getElementById("inputMosqueAddress").value.trim();
    const khatibName = document.getElementById("inputKhatibName").value.trim();
    const khutbahTitle = document.getElementById("inputKhutbahTitle").value.trim();
    const summaryText = document.getElementById("inputSummaryText").value.trim();
    const moralAction = document.getElementById("inputMoralAction").value.trim();

    if (!studentName || !className || !fridayDate || !mosqueName || !khutbahTitle || !summaryText) {
      this.showToast("Harap lengkapi semua kolom wajib (*)", "warning");
      return;
    }

    // Validasi batas minimal 20 kata untuk rangkuman khutbah
    const wordList = summaryText.split(/\s+/).filter(Boolean);
    if (wordList.length < 20) {
      this.showToast(`Isi rangkuman minimal 20 kata agar bermakna (saat ini baru ${wordList.length} kata)`, "warning");
      return;
    }

    const cleanDateStr = fridayDate.replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const summaryId = `JUM-${cleanDateStr}-${randomSuffix}`;

    const newSummary = {
      id: summaryId,
      studentName,
      nisn: "",
      className,
      fridayDate,
      mosqueName,
      mosqueAddress,
      khatibName,
      khutbahTitle,
      summaryText,
      quranHadith: "",
      moralAction,
      photoUrl: this.activePhotoBase64 || "",
      submittedAt: new Date().toISOString(),
      score: null,
      feedback: "",
      status: "pending"
    };

    // 1. Simpan ke Local Storage (tanpa foto besar agar hemat ruang)
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem("khatibku_summaries")) || [];
    } catch (err) {
      list = [];
    }
    // Hapus data sample lama jika ada
    list = list.filter(item => item && item.id && !item.id.startsWith("JUM-20261016-") && !item.id.startsWith("JUM-20261009-"));
    list.unshift(newSummary);
    localStorage.setItem("khatibku_summaries", JSON.stringify(list));

    // 2. Simpan ke Cloud Supabase (Otomatis ke Database Sekolah)
    if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
      try {
        const ok = await SupabaseConfig.insertSummary(newSummary);
        if (ok) {
          console.log("Rangkuman berhasil tersimpan ke Cloud Supabase");
        }
      } catch (err) {
        console.error("Gagal mengirim ke Supabase:", err);
      }
    }

    // Tampilkan Tanda Terima Resmi
    this.showReceipt(newSummary);

    // Reset Form
    document.getElementById("formSubmitSummary").reset();
    this.removePhoto();
    this.initFridayDate();
    
    // Reset counter kata
    const counter = document.getElementById("charCounter");
    if (counter) {
      counter.textContent = "0 kata (minimal 20 kata)";
      counter.style.color = "var(--text-light)";
    }

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
      const updateWordCount = () => {
        const text = textarea.value.trim();
        const words = text ? text.split(/\s+/).filter(Boolean) : [];
        const count = words.length;
        counter.textContent = `${count} kata (minimal 20 kata)`;
        counter.style.color = count >= 20 ? "var(--ywka-green)" : "var(--text-light)";
      };

      textarea.addEventListener("input", updateWordCount);
      updateWordCount();
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
