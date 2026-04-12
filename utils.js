/**
 * UTILS.JS - Utility functions for formatting, calculations, and data transformation
 */

const Utils = {
  /**
   * Format number as Indonesian Rupiah currency
   * @param {number} angka - Number to format
   * @returns {string} Formatted rupiah string
   */
  formatRupiah: (angka) =>
    new Intl.NumberFormat(CONFIG.LOCALE.LANGUAGE, {
      style: "currency",
      currency: CONFIG.LOCALE.CURRENCY,
      minimumFractionDigits: 0,
    }).format(angka),

  /**
   * Format date string to Indonesian format
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date or '-' if invalid
   */
  formatDate: (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : new Intl.DateTimeFormat(
          CONFIG.LOCALE.LANGUAGE,
          CONFIG.LOCALE.DATE_FORMAT,
        ).format(date);
  },

  /**
   * Parse various date string formats
   * @param {string} dateStr - Date string in any format
   * @returns {Date} Parsed date object
   */
  parseDateCustom: (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr.includes("-")) return new Date(dateStr);
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
  },

  /**
   * Convert date string to HTML input date format (YYYY-MM-DD)
   * @param {string} dateStr - Any date string format
   * @returns {string} YYYY-MM-DD format string
   */
  toInputDateString: (dateStr) => {
    const d = Utils.parseDateCustom(dateStr);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },

  /**
   * Calculate profit/loss percentage
   * @param {number} profit - Profit amount
   * @param {number} modal - Initial capital
   * @returns {number|string} Percentage fixed to 2 decimals or 0
   */
  calculatePercent: (profit, modal) =>
    modal > 0 ? ((profit / modal) * 100).toFixed(2) : 0,

  /**
   * Calculate comprehensive P&L data for a stock entry
   * @param {Object} row - Stock data row
   * @returns {Object} Object containing invest, currentVal, pl, plPercent, isProfit
   */
  getPLData: (row) => {
    const lot = parseInt(row[CONFIG.DATA_FIELDS.LOT_DAPAT]) || 0;
    const hargaIPO = parseFloat(row[CONFIG.DATA_FIELDS.HARGA_IPO]) || 0;
    const status = row[CONFIG.DATA_FIELDS.STATUS] || CONFIG.STATUS.HOLD;
    const hargaSaatIni =
      parseFloat(row[CONFIG.DATA_FIELDS.HARGA_SAAT_INI]) || hargaIPO;
    const hargaJual = parseFloat(row[CONFIG.DATA_FIELDS.HARGA_JUAL]) || 0;

    const invest = hargaIPO * lot * CONFIG.LOT_MULTIPLIER;
    const currentVal =
      status === CONFIG.STATUS.SOLD
        ? hargaJual * lot * CONFIG.LOT_MULTIPLIER
        : hargaSaatIni * lot * CONFIG.LOT_MULTIPLIER;
    const pl = currentVal - invest;
    const plPercent = invest > 0 ? (pl / invest) * 100 : 0;

    return { invest, currentVal, pl, plPercent, isProfit: pl >= 0 };
  },

  /**
   * Get date from row data (Tanggal Beli or Tanggal Input)
   * @param {Object} row - Stock data row
   * @returns {string} Date string
   */
  getRowDate: (row) =>
    row[CONFIG.DATA_FIELDS.TANGGAL_BELI] ||
    row[CONFIG.DATA_FIELDS.TANGGAL_INPUT] ||
    "-",

  /**
   * Hash password using SHA-256
   * @param {string} password - Password to hash
   * @returns {Promise<string>} Hashed password hex string
   */
  hashPassword: async (password) => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },

  /**
   * Get CSS classes for status badge
   * @param {string} status - Stock status (Hold/Sold)
   * @returns {Object} Object with className and HTML string
   */
  getStatusBadge: (status) => {
    if (status === CONFIG.STATUS.HOLD) {
      return {
        className:
          "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
        text: "HOLD",
      };
    }
    return {
      className:
        "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600",
      text: "SOLD",
    };
  },

  /**
   * Get CSS classes for P&L status
   * @param {boolean} isProfit - Is profit positive
   * @returns {Object} Object with colors and icon
   */
  getPLClasses: (isProfit) => ({
    color: isProfit
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400",
    bgColor: isProfit
      ? "bg-emerald-50 dark:bg-emerald-900/20"
      : "bg-rose-50 dark:bg-rose-900/20",
    icon: isProfit ? "fa-arrow-trend-up" : "fa-arrow-trend-down",
  }),

  /**
   * Sanitize HTML string for safe display
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  sanitize: (str) => {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};
