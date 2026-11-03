/**
 * siswa.js
 * Logika khusus Portal Siswa untuk pengisian dan pengiriman rangkuman khutbah Jum'at
 * Dioptimalkan untuk perangkat mobile (iOS Safari / iPhone & Android)
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
      // Jum'at adalah hari ke-5
      const diff = day >= 5 ? day - 5 : day + 2;
      const target = new Date(d.getTime() - (diff * 24 * 60 * 60 * 1000));
      dateInput.value = target.toISOString().split("T")[0];
    }
  },

  resetPhotoPrompt() {
    const promptWrapper = document.getElementById("photoUploadPrompt");
    if (promptWrapper) {
      promptWrapper.innerHTML = `
        <div class="upload-icon">📷</div>
        <div class="upload-text">Ketuk di sini untuk memilih foto dari galeri / kamera</div>
        <div class="upload-subtext">Format JPG, PNG, WEBP (Maksimal 10 MB)</div>
      `;
      promptWrapper.style.display = "block";
    }
  },

  handlePhotoSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validasi tipe berkas gambar (mendukung image/* dan ekstensi umum iPhone HEIC/HEIF/JPG)
    const isImage = (file.type && file.type.startsWith("image/")) || file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i);
    if (!isImage) {
      this.showToast("Harap pilih berkas foto / gambar", "warning");
      this.resetPhotoPrompt();
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      this.showToast("Ukuran foto maksimal 15 MB", "warning");
      this.resetPhotoPrompt();
      return;
    }

    // Tampilkan status proses
    const promptWrapper = document.getElementById("photoUploadPrompt");
    if (promptWrapper) {
      promptWrapper.innerHTML = `
        <div class="upload-icon">⏳</div>
        <div class="upload-text">Mengoptimalkan foto...</div>
        <div class="upload-subtext">Mohon tunggu sebentar</div>
      `;
    }

    // Kompresi foto secara cerdas menggunakan Canvas & ObjectURL (sangat hemat memori di Safari iOS)
    const processImageSource = (src, cleanupCallback) => {
      const img = new Image();
      img.onload = () => {
        if (cleanupCallback) cleanupCallback();
        try {
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

          // Output JPEG 0.72 sangat tajam dan ukuran hemat (< 80 KB)
          this.activePhotoBase64 = canvas.toDataURL("image/jpeg", 0.72);

          const previewWrapper = document.getElementById("photoPreviewContainer");
          const previewImg = document.getElementById("photoPreviewImg");

          if (previewImg && previewWrapper && promptWrapper) {
            previewImg.src = this.activePhotoBase64;
            previewWrapper.style.display = "inline-block";
            promptWrapper.style.display = "none";
            this.showToast("Foto berhasil dimuat & dioptimalkan", "success");
          }
        } catch (err) {
          console.error("Canvas compression error:", err);
          this.showToast("Gagal memproses resolusi foto", "warning");
          this.resetPhotoPrompt();
        }
      };

      img.onerror = () => {
        if (cleanupCallback) cleanupCallback();
        console.warn("Gagal render gambar melalui Image element");
        this.showToast("Format gambar tidak didukung langsung oleh browser Anda", "warning");
        this.resetPhotoPrompt();
      };

      img.src = src;
    };

    // Jalankan via URL.createObjectURL terlebih dahulu (paling efisien di mobile)
    try {
      const objectUrl = URL.createObjectURL(file);
      processImageSource(objectUrl, () => URL.revokeObjectURL(objectUrl));
    } catch (e) {
      // Fallback ke FileReader jika createObjectURL diblokir
      const reader = new FileReader();
      reader.onload = (re) => processImageSource(re.target.result);
      reader.onerror = () => {
        this.showToast("Gagal membaca berkas foto", "warning");
        this.resetPhotoPrompt();
      };
      reader.readAsDataURL(file);
    }
  },

  removePhoto() {
    this.activePhotoBase64 = "";
    const fileInput = document.getElementById("inputPhotoFile");
    if (fileInput) fileInput.value = "";
    const previewWrapper = document.getElementById("photoPreviewContainer");
    if (previewWrapper) previewWrapper.style.display = "none";
    this.resetPhotoPrompt();
  },

  async handleSubmit(e) {
    if (e) e.preventDefault();

    // Hapus tanda error lama
    document.querySelectorAll(".input-field.input-error, .select-field.input-error, .textarea-field.input-error").forEach(el => {
      el.classList.remove("input-error");
    });

    const nameInput = document.getElementById("inputStudentName");
    const classInput = document.getElementById("inputClass");
    const dateInput = document.getElementById("inputFridayDate");
    const mosqueInput = document.getElementById("inputMosqueName");
    const mosqueAddressInput = document.getElementById("inputMosqueAddress");
    const khatibInput = document.getElementById("inputKhatibName");
    const titleInput = document.getElementById("inputKhutbahTitle");
    const summaryInput = document.getElementById("inputSummaryText");
    const moralInput = document.getElementById("inputMoralAction");

    const studentName = nameInput ? nameInput.value.trim() : "";
    const className = classInput ? classInput.value : "";
    const fridayDate = dateInput ? dateInput.value : "";
    const mosqueName = mosqueInput ? mosqueInput.value.trim() : "";
    const mosqueAddress = mosqueAddressInput ? mosqueAddressInput.value.trim() : "";
    const khatibName = khatibInput ? khatibInput.value.trim() : "";
    const khutbahTitle = titleInput ? titleInput.value.trim() : "";
    const summaryText = summaryInput ? summaryInput.value.trim() : "";
    const moralAction = moralInput ? moralInput.value.trim() : "";

    // Fungsi pembantu penanda error dengan fokus dan scroll otomatis
    const markError = (inputEl, message) => {
      if (inputEl) {
        inputEl.classList.add("input-error");
        inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => inputEl.focus(), 200);
      }
      this.showToast(message, "warning");
    };

    // Validasi field wajib
    if (!studentName) {
      markError(nameInput, "Harap isi Nama Lengkap Siswa terlebih dahulu");
      return;
    }

    if (!className) {
      markError(classInput, "Harap pilih Kelas Anda");
      return;
    }

    if (!fridayDate) {
      markError(dateInput, "Harap tentukan Tanggal Pelaksanaan Jum'at");
      return;
    }

    if (!mosqueName) {
      markError(mosqueInput, "Harap isi Nama Masjid / Musholla");
      return;
    }

    if (!khutbahTitle) {
      markError(titleInput, "Harap isi Tema / Judul Khutbah Jum'at");
      return;
    }

    if (!summaryText) {
      markError(summaryInput, "Harap tuliskan Uraian Rangkuman Khutbah");
      return;
    }

    // Validasi batas minimal 20 kata untuk rangkuman khutbah
    const wordList = summaryText.split(/\s+/).filter(Boolean);
    if (wordList.length < 20) {
      const sisa = 20 - wordList.length;
      markError(summaryInput, `Isi rangkuman minimal 20 kata (saat ini baru ${wordList.length} kata). Tambahkan ${sisa} kata lagi.`);
      return;
    }

    // Kunci tombol submit dan tampilkan status loading
    const submitBtn = document.getElementById("btnSubmitSummary") || document.querySelector("button[type='submit']");
    let originalBtnHtml = "🚀 Kirim Rangkuman Khutbah";
    if (submitBtn) {
      originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `⏳ Mengirim Rangkuman...`;
      submitBtn.style.opacity = "0.75";
      submitBtn.style.cursor = "not-allowed";
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

    // 1. Simpan ke Local Storage dengan proteksi QuotaExceededError di Safari iOS
    try {
      let list = [];
      try {
        list = JSON.parse(localStorage.getItem("khatibku_summaries")) || [];
      } catch (err) {
        list = [];
      }
      list = list.filter(item => item && item.id && !item.id.startsWith("JUM-20261016-") && !item.id.startsWith("JUM-20261009-"));

      // Di localStorage simpan salinan tanpa base64 foto besar agar tidak melebihi kuota 5MB Safari
      const localCopy = { ...newSummary, photoUrl: newSummary.photoUrl ? "HAS_PHOTO" : "" };
      list.unshift(localCopy);
      localStorage.setItem("khatibku_summaries", JSON.stringify(list));
    } catch (storageErr) {
      console.warn("Penyimpanan lokal penuh/dibatasi di Safari:", storageErr);
    }

    // 2. Simpan ke Cloud Supabase (Otomatis ke Database Sekolah)
    let cloudSuccess = false;
    if (typeof SupabaseConfig !== "undefined" && SupabaseConfig.isConnected()) {
      try {
        cloudSuccess = await SupabaseConfig.insertSummary(newSummary);
        if (cloudSuccess) {
          console.log("Rangkuman berhasil tersimpan ke Cloud Supabase");
        }
      } catch (err) {
        console.error("Gagal mengirim ke Supabase:", err);
      }
    }

    // Kembalikan status tombol
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
    }

    // Tampilkan Tanda Terima Resmi
    this.showReceipt(newSummary);

    // Reset Form
    const form = document.getElementById("formSubmitSummary");
    if (form) form.reset();
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
      toast.style.animation = "slideInUp 0.25s ease reverse";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 4000);
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
        e.preventDefault();
        e.stopPropagation();
        this.removePhoto();
      });
    }

    // Dynamic word counter dengan pesan yang jelas saat mengetik
    const textarea = document.getElementById("inputSummaryText");
    const counter = document.getElementById("charCounter");
    if (textarea && counter) {
      const updateWordCount = () => {
        const text = textarea.value.trim();
        const words = text ? text.split(/\s+/).filter(Boolean) : [];
        const count = words.length;
        if (count === 0) {
          counter.textContent = "0 kata (minimal 20 kata)";
          counter.style.color = "var(--text-light)";
        } else if (count < 20) {
          counter.textContent = `${count} / 20 kata (Kurang ${20 - count} kata lagi)`;
          counter.style.color = "var(--ywka-orange)";
        } else {
          counter.textContent = `✓ ${count} kata (Memenuhi syarat minimal 20 kata)`;
          counter.style.color = "var(--ywka-green)";
        }
      };

      textarea.addEventListener("input", updateWordCount);
      updateWordCount();
    }

    // Hapus efek error merah segera saat siswa mulai mengisi input
    const inputsToWatch = [
      "inputStudentName", "inputClass", "inputFridayDate",
      "inputMosqueName", "inputKhutbahTitle", "inputSummaryText"
    ];
    inputsToWatch.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => el.classList.remove("input-error"));
        el.addEventListener("change", () => el.classList.remove("input-error"));
      }
    });
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
