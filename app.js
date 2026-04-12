/**
 * APP.JS - Main application controller
 * Orchestrates data flow and user interactions
 *
 * Dependencies:
 * - constants.js  (Configuration and constants)
 * - utils.js      (Utility functions)
 * - api.js        (API calls management)
 * - ui.js         (DOM manipulation)
 * - charts.js     (Chart rendering)
 */

const App = {
  // ===== APPLICATION STATE =====
  state: {
    allData: [],
    currentFilter: "ALL",
    currentSort: "newest",
    currentUser: null,
  },

  /**
   * Initialize application
   */
  init: () => {
    UI.initTheme();
    App.bindEvents();
    App.checkAuth();
  },

  /**
   * Check if user is authenticated
   */
  checkAuth: () => {
    const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
    if (!savedUser) {
      window.location.href = "login.html";
      return;
    }
    App.state.currentUser = savedUser;
    UI.setUserInfo(savedUser);
    App.loadData();
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.THEME);
    window.location.href = "login.html";
  },

  /**
   * Bind event listeners
   */
  bindEvents: () => {
    const sellForm = document.getElementById(CONFIG.SELECTORS.sellForm);
    if (sellForm) {
      sellForm.addEventListener("submit", App.handleSellStock);
    }

    const ipoForm = document.getElementById(CONFIG.SELECTORS.ipoForm);
    if (ipoForm) {
      ipoForm.addEventListener("submit", App.handleSaveIPO);
    }

    const statusSelect = document.getElementById(CONFIG.SELECTORS.statusSaham);
    if (statusSelect) {
      statusSelect.addEventListener("change", (e) => {
        UI.toggleSellFields(e.target.value === CONFIG.STATUS.SOLD);
      });
    }
  },

  /**
   * Load IPO data from API
   */
  loadData: async () => {
    UI.showTableLoading();
    try {
      const result = await API.fetchIPOData(App.state.currentUser);
      if (result.status === "success") {
        App.state.allData = result.data;
        App.applyFilter();
        UI.showToast(CONFIG.MESSAGES.DEFAULT.dataSuccess, "success");
      } else {
        UI.showTableError(CONFIG.MESSAGES.DEFAULT.dataError);
        UI.showToast(CONFIG.MESSAGES.DEFAULT.dataError, "error");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      UI.showTableError(CONFIG.MESSAGES.DEFAULT.networkError);
      UI.showToast(CONFIG.MESSAGES.DEFAULT.networkError, "error");
    }
  },

  /**
   * Set filter type
   * @param {string} filterType - Filter type (1M, 3M, YTD, ALL)
   */
  setFilter: (filterType) => {
    App.state.currentFilter = filterType;

    // Update button styles
    ["1M", "3M", "YTD", "ALL"].forEach((type) => {
      const btn = document.getElementById(`filter-${type}`);
      if (btn) {
        if (type === filterType) {
          btn.className =
            "flex-1 md:flex-none px-4 py-2 sm:py-1.5 text-xs sm:text-sm font-bold rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm transition-colors whitespace-nowrap";
        } else {
          btn.className =
            "flex-1 md:flex-none px-4 py-2 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap";
        }
      }
    });

    App.applyFilter();
  },

  /**
   * Set sort type
   * @param {string} sortType - Sort type (newest, oldest, pl_high, pl_low, az)
   */
  setSort: (sortType) => {
    App.state.currentSort = sortType;
    App.applyFilter();
  },

  /**
   * Apply filter and sort to data
   */
  applyFilter: () => {
    let processedData = [...App.state.allData];
    const today = new Date();
    let pastDate = new Date();

    // Apply time filter
    if (App.state.currentFilter === "1M") {
      pastDate.setMonth(today.getMonth() - 1);
    } else if (App.state.currentFilter === "3M") {
      pastDate.setMonth(today.getMonth() - 3);
    } else if (App.state.currentFilter === "YTD") {
      pastDate = new Date(today.getFullYear(), 0, 1);
    }

    if (App.state.currentFilter !== "ALL") {
      processedData = processedData.filter((row) => {
        const dateStr = Utils.getRowDate(row);
        const rowDate = Utils.parseDateCustom(dateStr);
        return isNaN(rowDate) || rowDate >= pastDate;
      });
    }

    // Apply sort
    processedData.sort((a, b) => {
      const dateA = Utils.parseDateCustom(Utils.getRowDate(a)).getTime();
      const dateB = Utils.parseDateCustom(Utils.getRowDate(b)).getTime();
      const plA = Utils.getPLData(a).pl;
      const plB = Utils.getPLData(b).pl;

      switch (App.state.currentSort) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "pl_high":
          return plB - plA;
        case "pl_low":
          return plA - plB;
        case "az":
          return (a[CONFIG.DATA_FIELDS.TICKER] || "").localeCompare(
            b[CONFIG.DATA_FIELDS.TICKER] || "",
          );
        default:
          return 0;
      }
    });

    App.renderTable(processedData);
    App.calculateMetrics(processedData);
  },

  /**
   * Render table with IPO data
   * @param {Array<Object>} data - Array of IPO data rows
   */
  renderTable: (data) => {
    const tableBody = document.getElementById(CONFIG.SELECTORS.tableBody);
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (data.length === 0) {
      UI.showTableEmpty();
      return;
    }

    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.className =
        "block md:table-row w-full bg-white dark:bg-slate-800 mb-4 md:mb-0 rounded-xl md:rounded-none shadow-sm md:shadow-none border border-slate-200 dark:border-slate-700 md:border-b md:border-x-0 md:border-t-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors overflow-hidden";
      tr.innerHTML = App.generateRowHTML(row);
      tableBody.appendChild(tr);
    });
  },

  /**
   * Generate HTML for a single table row
   * @private
   * @param {Object} row - IPO data row
   * @returns {string} HTML string for table row
   */
  generateRowHTML: (row) => {
    const id = row[CONFIG.DATA_FIELDS.ID];
    const ticker = row[CONFIG.DATA_FIELDS.TICKER] || "-";
    const lot = parseInt(row[CONFIG.DATA_FIELDS.LOT_DAPAT]) || 0;
    const hargaIPO = parseFloat(row[CONFIG.DATA_FIELDS.HARGA_IPO]) || 0;
    const status = row[CONFIG.DATA_FIELDS.STATUS] || CONFIG.STATUS.HOLD;
    const tglBeli = Utils.getRowDate(row);
    const tglJual = row[CONFIG.DATA_FIELDS.TANGGAL_JUAL] || "-";

    const calc = Utils.getPLData(row);
    const plClasses = Utils.getPLClasses(calc.isProfit);
    const statusBadge = Utils.getStatusBadge(status);

    const displayHarga =
      status === CONFIG.STATUS.SOLD
        ? `Rp ${row[CONFIG.DATA_FIELDS.HARGA_JUAL]}`
        : `Rp ${row[CONFIG.DATA_FIELDS.HARGA_SAAT_INI] || hargaIPO}`;

    const hargaSaatIniClass =
      status === CONFIG.STATUS.HOLD
        ? calc.isProfit
          ? "text-emerald-600 dark:text-emerald-400"
          : calc.pl < 0
            ? "text-rose-600 dark:text-rose-400"
            : "text-slate-800 dark:text-slate-200"
        : "text-slate-800 dark:text-slate-200";

    const actionBtn =
      status === CONFIG.STATUS.HOLD
        ? `<button onclick="App.openSellModal('${id}', '${ticker}')" class="w-full md:w-24 inline-flex justify-center items-center px-3 py-2.5 md:py-1.5 text-xs font-bold rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all"><i class="fas fa-hand-holding-usd mr-1.5"></i> JUAL</button>`
        : `<div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight text-center md:text-left w-full md:w-auto">Tgl Jual:<br/><span class="font-bold text-slate-700 dark:text-slate-300">${Utils.formatDate(tglJual)}</span></div>`;

    const statusBadgeHTML = `<span class="px-2.5 py-1 inline-flex text-[10px] sm:text-xs font-black rounded border ${statusBadge.className}">${statusBadge.text}</span>`;

    return `
      <td class="p-4 md:px-6 md:py-4 block md:table-cell border-b border-slate-100 dark:border-slate-700 md:border-none">
          <div class="flex justify-between items-center md:block">
              <span class="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Saham</span>
              <div class="text-right md:text-left">
                  <div class="text-base md:text-lg font-black text-indigo-700 dark:text-indigo-400 tracking-tight flex items-center justify-end md:justify-start gap-2">
                      ${ticker} <span class="md:hidden">${statusBadgeHTML}</span>
                  </div>
                  <div class="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-bold">${row[CONFIG.DATA_FIELDS.UNDERWRITER] || "-"}</div>
                  <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Beli: ${Utils.formatDate(tglBeli)}</div>
              </div>
          </div>
      </td>
      <td class="p-4 md:px-6 md:py-4 block md:table-cell border-b border-slate-100 dark:border-slate-700 md:border-none bg-slate-50/50 dark:bg-slate-800/50 md:bg-transparent">
          <div class="flex justify-between items-center md:block">
              <span class="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Vol & Modal</span>
              <div class="text-right md:text-left">
                  <div class="text-sm text-slate-900 dark:text-slate-100 font-bold">${lot} Lot</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${Utils.formatRupiah(calc.invest)}</div>
              </div>
          </div>
      </td>
      <td class="p-4 md:px-6 md:py-4 block md:table-cell border-b border-slate-100 dark:border-slate-700 md:border-none">
          <div class="flex justify-between items-center md:block">
              <span class="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Harga</span>
              <div class="text-right md:text-left">
                  <div class="text-sm font-black ${hargaSaatIniClass}">${displayHarga}</div>
                  <div class="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">IPO: Rp ${hargaIPO}</div>
              </div>
          </div>
      </td>
      <td class="p-4 md:px-6 md:py-4 block md:table-cell md:border-none bg-slate-50/50 dark:bg-slate-800/50 md:bg-transparent">
          <div class="flex justify-between items-center md:block">
              <span class="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">P/L (Rp)</span>
              <div class="text-right md:text-left">
                  <div class="text-sm font-black ${plClasses.color} flex items-center justify-end md:justify-start">
                      <i class="fas ${plClasses.icon} mr-1.5 text-xs"></i>${Utils.formatRupiah(Math.abs(calc.pl))}
                  </div>
                  <div class="text-[10px] md:text-xs font-bold mt-1 ${plClasses.color} ${plClasses.bgColor} inline-block px-1.5 py-0.5 rounded">${calc.plPercent.toFixed(2)}%</div>
              </div>
          </div>
      </td>
      <td class="p-4 md:px-6 md:py-4 block md:table-cell align-middle bg-slate-100/50 dark:bg-slate-900/30 md:bg-transparent border-t border-slate-200 dark:border-slate-700 md:border-none">
          <div class="flex flex-col md:items-center justify-center gap-2">
              <div class="hidden md:block">${statusBadgeHTML}</div>
              ${actionBtn}
          </div>
          <div class="mt-3 md:mt-3 flex justify-center gap-5 md:gap-4 pt-3 md:pt-2 border-t border-slate-200 dark:border-slate-700">
              <button type="button" onclick="App.openFormModal('${id}')" class="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-xs font-bold"><i class="fas fa-edit text-sm"></i> <span class="md:hidden">Edit</span></button>
              <button type="button" onclick="App.deleteIPO('${id}', '${ticker}')" class="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-bold"><i class="fas fa-trash text-sm"></i> <span class="md:hidden">Hapus</span></button>
          </div>
      </td>`;
  },

  /**
   * Calculate and display dashboard metrics
   * @param {Array<Object>} data - Array of IPO data rows
   */
  calculateMetrics: (data) => {
    let metrics = {
      invest: 0,
      unrealized: 0,
      realized: 0,
      count: data.length,
      winningTrades: 0,
      totalPlPercent: 0,
    };

    let chartLabels = [];
    let chartPLData = [];
    let chartInvestData = [];
    let chartColors = [];

    // Calculate metrics
    data.forEach((row) => {
      const calc = Utils.getPLData(row);
      metrics.invest += calc.invest;

      if (row[CONFIG.DATA_FIELDS.STATUS] === CONFIG.STATUS.HOLD) {
        metrics.unrealized += calc.pl;
      } else if (row[CONFIG.DATA_FIELDS.STATUS] === CONFIG.STATUS.SOLD) {
        metrics.realized += calc.pl;
      }

      if (calc.isProfit && calc.pl > 0) metrics.winningTrades++;
      metrics.totalPlPercent += calc.plPercent;

      // Prepare chart data
      if (chartLabels.length < CONFIG.CHART.maxItems) {
        chartLabels.push(row[CONFIG.DATA_FIELDS.TICKER]);
        chartPLData.push(calc.pl);
        chartInvestData.push(calc.invest);
        chartColors.push(
          calc.isProfit ? CONFIG.CHART.colors.profit : CONFIG.CHART.colors.loss,
        );
      }
    });

    // Update dashboard
    const countEl = document.getElementById(CONFIG.SELECTORS.dashCount);
    if (countEl) countEl.innerText = `${metrics.count} IPO`;

    const investEl = document.getElementById(CONFIG.SELECTORS.dashInvestasi);
    if (investEl) investEl.innerText = Utils.formatRupiah(metrics.invest);

    UI.updateDashboardMetric(
      CONFIG.SELECTORS.dashUnrealized,
      metrics.unrealized,
    );
    UI.updateDashboardMetric(CONFIG.SELECTORS.dashRealized, metrics.realized);

    // Calculate win rate and average P&L
    const winRate =
      metrics.count > 0 ? (metrics.winningTrades / metrics.count) * 100 : 0;
    const avgPl =
      metrics.count > 0 ? metrics.totalPlPercent / metrics.count : 0;

    const winrateEl = document.getElementById(CONFIG.SELECTORS.dashWinrate);
    if (winrateEl) winrateEl.innerText = `${winRate.toFixed(1)}%`;

    const avgPlEl = document.getElementById(CONFIG.SELECTORS.dashAvgPl);
    if (avgPlEl) {
      avgPlEl.innerText = `${avgPl.toFixed(2)}%`;
      avgPlEl.className = `text-lg sm:text-xl font-black ${
        avgPl >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      }`;
    }

    // Render charts
    Charts.render(chartLabels, chartPLData, chartInvestData, chartColors);
  },

  /**
   * Open form modal for add/edit
   * @param {string|null} id - IPO ID if editing, null if adding
   */
  openFormModal: (id = null) => {
    UI.clearForm();
    UI.toggleSellFields(false);

    if (id) {
      const data = App.state.allData.find(
        (d) => d[CONFIG.DATA_FIELDS.ID] === id,
      );
      if (data) {
        document.getElementById(CONFIG.SELECTORS.formId).value =
          data[CONFIG.DATA_FIELDS.ID] || "";
        document.getElementById(CONFIG.SELECTORS.ticker).value =
          data[CONFIG.DATA_FIELDS.TICKER] || "";
        document.getElementById(CONFIG.SELECTORS.nama).value =
          data[CONFIG.DATA_FIELDS.NAMA_PERUSAHAAN] || "";
        document.getElementById(CONFIG.SELECTORS.underwriter).value =
          data[CONFIG.DATA_FIELDS.UNDERWRITER] || "";
        document.getElementById(CONFIG.SELECTORS.hargaIpo).value =
          data[CONFIG.DATA_FIELDS.HARGA_IPO] || "";
        document.getElementById(CONFIG.SELECTORS.lotDapat).value =
          data[CONFIG.DATA_FIELDS.LOT_DAPAT] || "";
        document.getElementById(CONFIG.SELECTORS.statusSaham).value =
          data[CONFIG.DATA_FIELDS.STATUS] || "";
        document.getElementById(CONFIG.SELECTORS.tanggalBeli).value =
          Utils.toInputDateString(Utils.getRowDate(data));

        if (data[CONFIG.DATA_FIELDS.STATUS] === CONFIG.STATUS.SOLD) {
          document.getElementById(CONFIG.SELECTORS.formHargaJual).value =
            data[CONFIG.DATA_FIELDS.HARGA_JUAL] || "";
          document.getElementById(CONFIG.SELECTORS.formTanggalJual).value =
            Utils.toInputDateString(data[CONFIG.DATA_FIELDS.TANGGAL_JUAL]);
          UI.toggleSellFields(true);
        }
      }
      UI.openFormModal(CONFIG.FORM_LABELS.editTitle);
    } else {
      document.getElementById(CONFIG.SELECTORS.formId).value = "";
      document.getElementById(CONFIG.SELECTORS.tanggalBeli).valueAsDate =
        new Date();
      document.getElementById(CONFIG.SELECTORS.statusSaham).value =
        CONFIG.STATUS.HOLD;
      UI.openFormModal(CONFIG.FORM_LABELS.addTitle);
    }
  },

  /**
   * Close form modal
   */
  closeFormModal: () => {
    UI.closeFormModal();
  },

  /**
   * Handle save IPO form submission
   * @param {Event} e - Form submit event
   */
  handleSaveIPO: async (e) => {
    e.preventDefault();

    const form = document.getElementById(CONFIG.SELECTORS.ipoForm);
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const btnSubmit = document.getElementById(CONFIG.SELECTORS.btnSubmitForm);
    if (!btnSubmit) return;

    const values = UI.getFormValues();
    const isEdit = values.id && values.id.trim() !== "";

    UI.setButtonLoading(btnSubmit, true, "Menyimpan...");

    try {
      const result = await API.saveIPO(
        isEdit ? CONFIG.API_ACTIONS.EDIT : CONFIG.API_ACTIONS.ADD,
        App.state.currentUser,
        {
          id: values.id,
          ticker: values.ticker,
          nama_perusahaan: values.nama_perusahaan,
          underwriter: values.underwriter,
          harga_ipo: values.harga_ipo,
          lot_dapat: values.lot_dapat,
          tanggal_beli: values.tanggal_beli,
          status: values.status,
          harga_jual: values.harga_jual,
          tanggal_jual: values.tanggal_jual,
        },
      );

      if (result.status === "success") {
        UI.closeFormModal();
        App.loadData();
        UI.showToast(CONFIG.MESSAGES.DEFAULT.saveSuccess, "success");
      } else {
        UI.showToast(
          CONFIG.MESSAGES.DEFAULT.saveFailed + " " + result.message,
          "error",
        );
      }
    } catch (error) {
      console.error("Error saving IPO:", error);
      UI.showToast(CONFIG.MESSAGES.DEFAULT.connectionError, "error");
    } finally {
      UI.setButtonLoading(btnSubmit, false, CONFIG.FORM_LABELS.saveBtnText);
    }
  },

  /**
   * Delete IPO data
   * @param {string} id - IPO ID to delete
   * @param {string} ticker - Stock ticker
   */
  deleteIPO: (id, ticker) => {
    UI.showConfirm(
      `Apakah Anda yakin ingin menghapus data saham ${ticker}?`,
      async () => {
        try {
          const result = await API.deleteIPO(id, App.state.currentUser);
          if (result.status === "success") {
            UI.showToast(CONFIG.MESSAGES.DEFAULT.deleteSuccess, "success");
            App.loadData();
          } else {
            UI.showToast(
              CONFIG.MESSAGES.DEFAULT.deleteFailed + " " + result.message,
              "error",
            );
          }
        } catch (error) {
          console.error("Error deleting IPO:", error);
          UI.showToast(CONFIG.MESSAGES.DEFAULT.connectionError, "error");
        }
      },
    );
  },

  /**
   * Open sell modal
   * @param {string} id - IPO ID
   * @param {string} ticker - Stock ticker
   */
  openSellModal: (id, ticker) => {
    const sellIdEl = document.getElementById(CONFIG.SELECTORS.sellId);
    if (sellIdEl) sellIdEl.value = id;

    const sellPriceEl = document.getElementById(CONFIG.SELECTORS.sellPrice);
    if (sellPriceEl) sellPriceEl.value = "";

    const sellDateEl = document.getElementById(CONFIG.SELECTORS.sellDate);
    if (sellDateEl) sellDateEl.valueAsDate = new Date();

    UI.openSellModal(ticker);
  },

  /**
   * Close sell modal
   */
  closeSellModal: () => {
    UI.closeSellModal();
  },

  /**
   * Handle sell stock submission
   * @param {Event} e - Form submit event
   */
  handleSellStock: async (e) => {
    e.preventDefault();

    const btnConfirm = document.getElementById(CONFIG.SELECTORS.btnConfirmSell);
    if (!btnConfirm) return;

    const values = UI.getSellFormValues();
    UI.setButtonLoading(btnConfirm, true, "Memproses...");

    try {
      const result = await API.updateIPO(
        App.state.currentUser,
        values.id,
        values.harga_jual,
        values.tanggal_jual,
      );

      if (result.status === "success") {
        UI.closeSellModal();
        App.loadData();
        UI.showToast(CONFIG.MESSAGES.DEFAULT.sellSuccess, "success");
      } else {
        UI.showToast(
          CONFIG.MESSAGES.DEFAULT.sellFailed + " " + result.message,
          "error",
        );
      }
    } catch (error) {
      console.error("Error selling stock:", error);
      UI.showToast(CONFIG.MESSAGES.DEFAULT.systemError, "error");
    } finally {
      UI.setButtonLoading(btnConfirm, false, CONFIG.FORM_LABELS.sellBtnText);
    }
  },

  /**
   * Toggle theme
   */
  toggleTheme: () => {
    const isDark = document.documentElement.classList.contains("dark");
    UI.setTheme(!isDark);
    if (App.state.allData.length > 0) {
      App.applyFilter();
    }
  },
};

// ===== INITIALIZE APP =====
document.addEventListener("DOMContentLoaded", App.init);
