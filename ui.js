/**
 * UI.JS - DOM manipulation and UI update functions
 */

const UI = {
  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'info' (default)
   */
  showToast: (message, type = "info") => {
    const container = document.getElementById(CONFIG.SELECTORS.toastContainer);
    if (!container) return;

    const toast = document.createElement("div");
    const bgColor =
      type === "success"
        ? "bg-emerald-600"
        : type === "error"
          ? "bg-rose-600"
          : "bg-indigo-600";
    const icon =
      type === "success"
        ? "fa-check-circle"
        : type === "error"
          ? "fa-exclamation-circle"
          : "fa-info-circle";

    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0 pointer-events-auto`;
    toast.innerHTML = `<i class="fas ${icon} text-lg"></i> <span class="text-sm font-semibold">${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.remove("translate-y-10", "opacity-0"), 10);
    setTimeout(() => {
      toast.classList.add("translate-y-10", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  /**
   * Show confirmation modal
   * @param {string} message - Confirmation message
   * @param {Function} onConfirm - Callback function if confirmed
   */
  showConfirm: (message, onConfirm) => {
    const el = document.getElementById(CONFIG.SELECTORS.confirmMessage);
    if (el) el.innerText = message;

    window._pendingConfirmAction = onConfirm;
    const modal = document.getElementById(CONFIG.SELECTORS.customConfirmModal);
    if (modal) modal.classList.remove("hidden");
  },

  /**
   * Close confirmation modal
   */
  closeConfirm: () => {
    const modal = document.getElementById(CONFIG.SELECTORS.customConfirmModal);
    if (modal) modal.classList.add("hidden");
    window._pendingConfirmAction = null;
  },

  /**
   * Execute pending confirm action
   */
  executeConfirm: () => {
    if (window._pendingConfirmAction) {
      window._pendingConfirmAction();
    }
    UI.closeConfirm();
  },

  /**
   * Set button loading state
   * @param {HTMLElement} button - Button element
   * @param {boolean} isLoading - Loading state
   * @param {string} text - Button text (HTML allowed)
   */
  setButtonLoading: (button, isLoading, text) => {
    button.disabled = isLoading;
    button.innerHTML = isLoading
      ? `<i class="fas fa-spinner fa-spin mr-2"></i>${text}`
      : text;
    button.classList.toggle("opacity-70", isLoading);
    button.classList.toggle("cursor-not-allowed", isLoading);
  },

  /**
   * Show table error message
   * @param {string} message - Error message
   */
  showTableError: (message) => {
    const tableBody = document.getElementById(CONFIG.SELECTORS.tableBody);
    if (tableBody) {
      tableBody.innerHTML = `
        <tr class="block md:table-row w-full">
          <td colspan="5" class="px-6 py-8 text-center text-rose-500 font-medium bg-rose-50 dark:bg-rose-900/20 block md:table-cell">
            <i class="fas fa-exclamation-triangle mr-2"></i>${message}
          </td>
        </tr>`;
    }
  },

  /**
   * Show table loading state
   */
  showTableLoading: () => {
    const tableBody = document.getElementById(CONFIG.SELECTORS.tableBody);
    if (tableBody) {
      tableBody.innerHTML = `
        <tr class="block md:table-row">
          <td colspan="5" class="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400 block md:table-cell border-none">
            <i class="fas fa-circle-notch fa-spin text-3xl text-indigo-400 mb-3 block"></i>
            <p class="font-medium animate-pulse">${CONFIG.MESSAGES.DEFAULT.loadingData}</p>
          </td>
        </tr>`;
    }
  },

  /**
   * Show empty table state
   */
  showTableEmpty: () => {
    const tableBody = document.getElementById(CONFIG.SELECTORS.tableBody);
    if (tableBody) {
      tableBody.innerHTML = `
        <tr class="block md:table-row w-full">
          <td colspan="5" class="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400 block md:table-cell bg-slate-50/50 dark:bg-slate-800/50">
            <i class="fas fa-folder-open text-4xl text-slate-300 dark:text-slate-600 mb-3 block"></i>
            <span class="font-medium">Data portofolio kosong.</span>
          </td>
        </tr>`;
    }
  },

  /**
   * Update dashboard metric element
   * @param {string} elementId - Element ID
   * @param {number} value - Value to display (will be formatted as rupiah)
   */
  updateDashboardMetric: (elementId, value) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerText = Utils.formatRupiah(value);
    el.classList.remove(
      "text-rose-600",
      "dark:text-rose-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-purple-600",
      "dark:text-purple-400",
    );

    const colorClass =
      value >= 0
        ? elementId.includes("unrealized")
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-purple-600 dark:text-purple-400"
        : "text-rose-600 dark:text-rose-400";

    el.className =
      el.className
        .split(" ")
        .filter((c) => !c.includes("text-"))
        .join(" ") +
      " " +
      colorClass;
  },

  /**
   * Set theme (light/dark)
   * @param {boolean} isDark - True for dark mode
   */
  setTheme: (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, "light");
    }
    UI.updateThemeIcon();
  },

  /**
   * Update theme toggle icon
   */
  updateThemeIcon: () => {
    const icon = document.querySelector(`#${CONFIG.SELECTORS.themeToggle} i`);
    if (icon) {
      const isDark = document.documentElement.classList.contains("dark");
      icon.className = isDark
        ? "fas fa-sun text-yellow-300 text-sm"
        : "fas fa-moon text-white text-sm";
    }
  },

  /**
   * Initialize and load theme preference
   */
  initTheme: () => {
    const isDark =
      localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) === "dark" ||
      (!localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    UI.setTheme(isDark);
  },

  /**
   * Set user info in navbar
   * @param {string} username - Username to display
   */
  setUserInfo: (username) => {
    const el = document.getElementById(CONFIG.SELECTORS.displayUsername);
    if (el) el.innerText = username;

    const profile = document.getElementById(CONFIG.SELECTORS.userProfile);
    if (profile) {
      profile.classList.remove("hidden");
      profile.classList.add("flex");
    }
  },

  /**
   * Clear user info (logout)
   */
  clearUserInfo: () => {
    const profile = document.getElementById(CONFIG.SELECTORS.userProfile);
    if (profile) {
      profile.classList.add("hidden");
      profile.classList.remove("flex");
    }
  },

  /**
   * Open form modal
   * @param {string} title - Modal title (HTML)
   * @param {boolean} isEdit - Is edit mode
   */
  openFormModal: (title) => {
    const modal = document.getElementById(CONFIG.SELECTORS.formModal);
    if (modal) {
      const titleEl = document.getElementById(CONFIG.SELECTORS.formModalTitle);
      if (titleEl) titleEl.innerHTML = title;
      modal.classList.remove("hidden");
      setTimeout(() => {
        const content = modal.firstElementChild;
        if (content) content.classList.add("modal-enter-active");
      }, 10);
    }
  },

  /**
   * Close form modal
   */
  closeFormModal: () => {
    const modal = document.getElementById(CONFIG.SELECTORS.formModal);
    if (modal) {
      const content = modal.firstElementChild;
      if (content) content.classList.remove("modal-enter-active");
      setTimeout(() => modal.classList.add("hidden"), 300);
    }
  },

  /**
   * Open sell modal
   * @param {string} ticker - Stock ticker
   */
  openSellModal: (ticker) => {
    const tickerEl = document.getElementById(CONFIG.SELECTORS.sellTicker);
    if (tickerEl) tickerEl.innerText = ticker;

    const modal = document.getElementById(CONFIG.SELECTORS.sellModal);
    if (modal) {
      modal.classList.remove("hidden");
      setTimeout(() => {
        const content = modal.firstElementChild;
        if (content) content.classList.add("modal-enter-active");
      }, 10);
    }
  },

  /**
   * Close sell modal
   */
  closeSellModal: () => {
    const modal = document.getElementById(CONFIG.SELECTORS.sellModal);
    if (modal) {
      const content = modal.firstElementChild;
      if (content) content.classList.remove("modal-enter-active");
      setTimeout(() => modal.classList.add("hidden"), 300);
    }
  },

  /**
   * Toggle sell fields visibility
   * @param {boolean} show - Show/hide sell fields
   */
  toggleSellFields: (show) => {
    const sellFields = document.getElementById(CONFIG.SELECTORS.sellFields);
    const hargaJualEl = document.getElementById(CONFIG.SELECTORS.formHargaJual);
    const tanggalJualEl = document.getElementById(
      CONFIG.SELECTORS.formTanggalJual,
    );

    if (sellFields) {
      sellFields.classList.toggle("hidden", !show);
      sellFields.classList.toggle("grid", show);
    }
    if (hargaJualEl) hargaJualEl.required = show;
    if (tanggalJualEl) tanggalJualEl.required = show;
  },

  /**
   * Get all form values
   * @returns {Object} Form values object
   */
  getFormValues: () => {
    const status = document.getElementById(CONFIG.SELECTORS.statusSaham).value;
    return {
      id: document.getElementById(CONFIG.SELECTORS.formId).value,
      ticker: document
        .getElementById(CONFIG.SELECTORS.ticker)
        .value.toUpperCase(),
      nama_perusahaan: document.getElementById(CONFIG.SELECTORS.nama).value,
      underwriter: document.getElementById(CONFIG.SELECTORS.underwriter).value,
      harga_ipo: document.getElementById(CONFIG.SELECTORS.hargaIpo).value,
      lot_dapat: document.getElementById(CONFIG.SELECTORS.lotDapat).value,
      tanggal_beli: document.getElementById(CONFIG.SELECTORS.tanggalBeli).value,
      status: status,
      harga_jual:
        status === CONFIG.STATUS.SOLD
          ? document.getElementById(CONFIG.SELECTORS.formHargaJual).value
          : "",
      tanggal_jual:
        status === CONFIG.STATUS.SOLD
          ? document.getElementById(CONFIG.SELECTORS.formTanggalJual).value
          : "",
    };
  },

  /**
   * Get all sell form values
   * @returns {Object} Sell form values
   */
  getSellFormValues: () => ({
    id: document.getElementById(CONFIG.SELECTORS.sellId).value,
    harga_jual: document.getElementById(CONFIG.SELECTORS.sellPrice).value,
    tanggal_jual: document.getElementById(CONFIG.SELECTORS.sellDate).value,
  }),

  /**
   * Clear form
   */
  clearForm: () => {
    const form = document.getElementById(CONFIG.SELECTORS.ipoForm);
    if (form) form.reset();
  },

  /**
   * Clear sell form
   */
  clearSellForm: () => {
    const form = document.getElementById(CONFIG.SELECTORS.sellForm);
    if (form) form.reset();
  },
};
