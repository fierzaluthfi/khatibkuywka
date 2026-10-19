/**
 * supabaseConfig.js
 * Konfigurasi dan klien integrasi database cloud Supabase untuk KhatibKu SMA YWKA
 */

const SupabaseConfig = {
  // Anda dapat memasukkan URL & Anon Key default di sini atau menyimpannya lewat tombol Pengaturan di website
  defaultUrl: "",
  defaultKey: "",

  getClient() {
    const savedUrl = localStorage.getItem("khatibku_supabase_url") || this.defaultUrl;
    const savedKey = localStorage.getItem("khatibku_supabase_key") || this.defaultKey;

    if (!savedUrl || !savedKey || typeof supabase === "undefined") {
      return null;
    }

    try {
      return supabase.createClient(savedUrl, savedKey);
    } catch (e) {
      console.error("Gagal menginisialisasi klien Supabase:", e);
      return null;
    }
  },

  isConnected() {
    return this.getClient() !== null;
  },

  saveCredentials(url, key) {
    if (url && key) {
      localStorage.setItem("khatibku_supabase_url", url.trim());
      localStorage.setItem("khatibku_supabase_key", key.trim());
    } else {
      localStorage.removeItem("khatibku_supabase_url");
      localStorage.removeItem("khatibku_supabase_key");
    }
  },

  getCredentials() {
    return {
      url: localStorage.getItem("khatibku_supabase_url") || this.defaultUrl,
      key: localStorage.getItem("khatibku_supabase_key") || this.defaultKey
    };
  },

  // Konversi camelCase ke snake_case untuk tabel database
  toDbFormat(item) {
    return {
      id: item.id,
      student_name: item.studentName,
      nisn: item.nisn || null,
      class_name: item.className,
      friday_date: item.fridayDate,
      mosque_name: item.mosqueName,
      mosque_address: item.mosqueAddress || null,
      khatib_name: item.khatibName || null,
      khutbah_title: item.khutbahTitle,
      summary_text: item.summaryText,
      quran_hadith: item.quranHadith || null,
      moral_action: item.moralAction || null,
      photo_url: item.photoUrl || null,
      score: item.score !== null && item.score !== undefined ? Number(item.score) : null,
      feedback: item.feedback || null,
      status: item.status || "pending",
      submitted_at: item.submittedAt || new Date().toISOString()
    };
  },

  // Konversi snake_case dari database ke camelCase di aplikasi
  fromDbFormat(row) {
    return {
      id: row.id,
      studentName: row.student_name,
      nisn: row.nisn || "",
      className: row.class_name,
      fridayDate: row.friday_date,
      mosqueName: row.mosque_name,
      mosqueAddress: row.mosque_address || "",
      khatibName: row.khatib_name || "",
      khutbahTitle: row.khutbah_title,
      summaryText: row.summary_text,
      quranHadith: row.quran_hadith || "",
      moralAction: row.moral_action || "",
      photoUrl: row.photo_url || "",
      score: row.score !== null ? Number(row.score) : null,
      feedback: row.feedback || "",
      status: row.status || "pending",
      submittedAt: row.submitted_at || row.created_at
    };
  },

  // 1. Fetch seluruh rangkuman dari Supabase
  async fetchSummaries() {
    const client = this.getClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from("friday_summaries")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetch error:", error);
        return null;
      }

      return data.map(this.fromDbFormat);
    } catch (err) {
      console.warn("Supabase request failed:", err);
      return null;
    }
  },

  // 2. Insert rangkuman baru ke Supabase
  async insertSummary(item) {
    const client = this.getClient();
    if (!client) return false;

    try {
      const dbItem = this.toDbFormat(item);
      const { error } = await client
        .from("friday_summaries")
        .insert([dbItem]);

      if (error) {
        console.error("Gagal simpan ke Supabase:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error inserting to Supabase:", err);
      return false;
    }
  },

  // 3. Update nilai dan catatan guru ke Supabase
  async updateSummary(id, updates) {
    const client = this.getClient();
    if (!client) return false;

    try {
      const dbUpdates = {};
      if (updates.score !== undefined) dbUpdates.score = updates.score;
      if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      const { error } = await client
        .from("friday_summaries")
        .update(dbUpdates)
        .eq("id", id);

      if (error) {
        console.error("Gagal update ke Supabase:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error updating in Supabase:", err);
      return false;
    }
  },

  // 4. Hapus rangkuman dari Supabase
  async deleteSummary(id) {
    const client = this.getClient();
    if (!client) return false;

    try {
      const { error } = await client
        .from("friday_summaries")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Gagal menghapus dari Supabase:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error deleting in Supabase:", err);
      return false;
    }
  }
};

window.SupabaseConfig = SupabaseConfig;
