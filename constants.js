/**
 * CONSTANTS.JS - Centralized configuration and constants
 * Contains: API URLs, DOM selectors, messages, and configuration
 */

const CONFIG = {
  // ===== API Configuration =====
  API_URL:
    "https://script.google.com/macros/s/AKfycbwscq9g3lC8OsdBlQFtmSm48cL65w-WwV7uAIYjdRU5s_rHyXLRRR-vCFK2dhnbXZ5GDQ/exec",

  // ===== Storage Keys =====
  STORAGE_KEYS: {
    USER: "cuanIpoUser",
    THEME: "theme",
  },

  // ===== DOM Selectors =====
  SELECTORS: {
    // Navigation & Auth
    displayUsername: "displayUsername",
    userProfile: "userProfile",
    themeToggle: "themeToggle",

    // Dashboard Metrics
    dashCount: "dash-count",
    dashInvestasi: "dash-investasi",
    dashUnrealized: "dash-unrealized",
    dashRealized: "dash-realized",
    dashWinrate: "dash-winrate",
    dashAvgPl: "dash-avgpl",

    // Table
    tableBody: "tableBody",
    apiWarning: "api-warning",

    // Forms
    ipoForm: "ipoForm",
    formId: "formId",
    ticker: "ticker",
    nama: "nama",
    underwriter: "underwriter",
    hargaIpo: "harga_ipo",
    lotDapat: "lot_dapat",
    statusSaham: "status_saham",
    tanggalBeli: "tanggal_beli",
    formHargaJual: "form_harga_jual",
    formTanggalJual: "form_tanggal_jual",
    sellFields: "sellFields",
    btnSubmitForm: "btnSubmitForm",

    // Sell Modal
    sellForm: "sellForm",
    sellId: "sellId",
    sellTicker: "sellTicker",
    sellPrice: "sellPrice",
    sellDate: "sellDate",
    btnConfirmSell: "btnConfirmSell",

    // Modals
    formModal: "formModal",
    formModalTitle: "formModalTitle",
    sellModal: "sellModal",
    customConfirmModal: "customConfirmModal",
    confirmMessage: "confirmMessage",

    // Charts
    plBarChart: "plBarChart",
    allocationPieChart: "allocationPieChart",

    // Toast
    toastContainer: "toast-container",
  },

  // ===== Messages =====
  MESSAGES: {
    DEFAULT: {
      loadingData: "Menyinkronkan data...",
      dataSuccess: "Data berhasil dimuat",
      dataError: "Gagal mengambil data dari server.",
      networkError: "Koneksin API terputus.",
      saveSuccess: "Data berhasil disimpan",
      saveFailed: "Gagal menyimpan:",
      deleteSuccess: "Data dihapus",
      deleteFailed: "Gagal menghapus:",
      sellSuccess: "Saham berhasil dijual!",
      sellFailed: "Gagal update:",
      connectionError: "Terjadi kesalahan koneksi.",
      systemError: "Terjadi kesalahan sistem.",
      requiredError: "Username dan Password wajib diisi!",
    },
    AUTH: {
      loginSuccess: "Login Berhasil! Mengalihkan...",
      loginError: "Gagal terhubung ke server.",
      registerSuccess: "Registrasi Berhasil! Silakan Login.",
      registerError: "Gagal terhubung ke server.",
    },
  },

  // ===== Form Labels =====
  FORM_LABELS: {
    addTitle:
      '<i class="fas fa-plus-circle text-indigo-500 dark:text-indigo-400 mr-2"></i>Catat IPO Baru',
    editTitle:
      '<i class="fas fa-edit text-blue-500 dark:text-blue-400 mr-2"></i>Edit Data IPO',
    saveBtnText: '<i class="fas fa-save mr-2"></i> Simpan Data',
    sellBtnText: '<i class="fas fa-check mr-1.5"></i> Jual',
  },

  // ===== Status Values =====
  STATUS: {
    HOLD: "Hold",
    SOLD: "Sold",
  },

  // ===== Chart Configuration =====
  CHART: {
    maxItems: 15,
    colors: {
      profit: "rgba(16, 185, 129, 0.7)",
      loss: "rgba(244, 63, 94, 0.7)",
      darkGradient: "#334155",
      lightGradient: "#e2e8f0",
      doughnutColors: [
        "#6366f1",
        "#8b5cf6",
        "#ec4899",
        "#f43f5e",
        "#f97316",
        "#eab308",
        "#10b981",
        "#14b8a6",
        "#0ea5e9",
        "#3b82f6",
      ],
    },
    font: {
      family: "'Inter', 'Segoe UI', sans-serif",
      textColor: "#94a3b8",
    },
  },

  // ===== Locale Configuration =====
  LOCALE: {
    LANGUAGE: "id-ID",
    DATE_FORMAT: {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
    CURRENCY: "IDR",
  },

  // ===== Filter & Sort Options =====
  FILTERS: {
    "1M": "1 Bulan",
    "3M": "3 Bulan",
    YTD: "Tahun Ini",
    ALL: "Semua Data",
  },

  SORTS: {
    newest: "Terbaru",
    oldest: "Terlama",
    pl_high: "P/L Tertinggi",
    pl_low: "P/L Terendah",
    az: "A-Z",
  },

  // ===== Data Field Names =====
  DATA_FIELDS: {
    ID: "ID",
    TICKER: "Ticker",
    NAMA_PERUSAHAAN: "Nama Perusahaan",
    UNDERWRITER: "Underwriter",
    HARGA_IPO: "Harga IPO",
    LOT_DAPAT: "Lot Dapat",
    STATUS: "Status",
    HARGA_SAAT_INI: "Harga Saat Ini",
    HARGA_JUAL: "Harga Jual",
    TANGGAL_BELI: "Tanggal Beli",
    TANGGAL_INPUT: "Tanggal Input",
    TANGGAL_JUAL: "Tanggal Jual",
  },

  // ===== API Actions =====
  API_ACTIONS: {
    LOGIN: "login",
    REGISTER: "register",
    ADD: "add",
    EDIT: "edit",
    DELETE: "delete",
    UPDATE: "update",
  },

  // ===== Item Multiplier =====
  LOT_MULTIPLIER: 100,

  // ===== Google Sheets Configuration =====
  // Nama sheet harus sesuai dengan yang ada di Google Spreadsheet
  SHEETS: {
    DATA: "Portfolio", // Sheet untuk menyimpan IPO data
    USERS: "Users", // Sheet untuk menyimpan user login
  },
};

// Validate API URL on page load
function validateAPIUrl() {
  if (CONFIG.API_URL === "MASUKKAN_URL_API_ANDA_DISINI") {
    const warningEl = document.getElementById(CONFIG.SELECTORS.apiWarning);
    if (warningEl) {
      warningEl.classList.remove("hidden");
    }
  }
}

// Initialize Chart.js defaults
function initializeChartDefaults() {
  if (typeof Chart !== "undefined") {
    Chart.defaults.color = CONFIG.CHART.font.textColor;
    Chart.defaults.font.family = CONFIG.CHART.font.family;
  }
}

// Call on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  validateAPIUrl();
  initializeChartDefaults();
});
