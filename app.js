/**
 * 1. CONFIGURATION
 */
// GANTI DENGAN URL API APPS SCRIPT KAMU
const API_URL =
  "https://script.google.com/macros/s/AKfycbwscq9g3lC8OsdBlQFtmSm48cL65w-WwV7uAIYjdRU5s_rHyXLRRR-vCFK2dhnbXZ5GDQ/exec";

if (API_URL === "MASUKKAN_URL_API_ANDA_DISINI") {
  document.getElementById("api-warning").classList.remove("hidden");
}

Chart.defaults.color = "#94a3b8";
Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";

/**
 * 2. UTILITY FUNCTIONS
 */
const Utils = {
  formatRupiah: (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka),
  formatDate: (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date);
  },
  parseDateCustom: (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr.includes("-")) return new Date(dateStr);
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
  },
  toInputDateString: (dateStr) => {
    const d = Utils.parseDateCustom(dateStr);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },
  calculatePercent: (profit, modal) =>
    modal > 0 ? ((profit / modal) * 100).toFixed(2) : 0,

  getPLData: (row) => {
    const lot = parseInt(row["Lot Dapat"]) || 0;
    const hargaIPO = parseFloat(row["Harga IPO"]) || 0;
    const status = row["Status"] || "Hold";
    const hargaSaatIni = parseFloat(row["Harga Saat Ini"]) || hargaIPO;
    const hargaJual = parseFloat(row["Harga Jual"]) || 0;

    const invest = hargaIPO * lot * 100;
    const currentVal =
      status === "Sold" ? hargaJual * lot * 100 : hargaSaatIni * lot * 100;
    const pl = currentVal - invest;
    const plPercent = invest > 0 ? (pl / invest) * 100 : 0;

    return { invest, currentVal, pl, plPercent, isProfit: pl >= 0 };
  },
};

/**
 * 3. CORE APPLICATION STATE & LOGIC
 */
const IPOApp = {
  allData: [],
  currentFilter: "ALL",
  currentSort: "newest",
  barChartInstance: null,
  pieChartInstance: null,
  pendingConfirmAction: null,
  currentUser: null,

  init: () => {
    IPOApp.initTheme();
    IPOApp.bindEvents();
    IPOApp.checkAuth();
  },

  // --- AUTH CHECKER ---
  checkAuth: () => {
    const savedUser = localStorage.getItem("cuanIpoUser");
    if (!savedUser) {
      window.location.href = "login.html";
      return;
    }
    IPOApp.currentUser = savedUser;
    document.getElementById("displayUsername").innerText = savedUser;
    document.getElementById("userProfile").classList.remove("hidden");
    document.getElementById("userProfile").classList.add("flex");

    IPOApp.fetchData();
  },

  logout: () => {
    localStorage.removeItem("cuanIpoUser");
    window.location.href = "login.html";
  },

  // --- CUSTOM UI: TOAST & CONFIRM MODAL ---
  showToast: (message, type = "info") => {
    const container = document.getElementById("toast-container");
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

  openConfirm: (message, actionFn) => {
    document.getElementById("confirmMessage").innerText = message;
    IPOApp.pendingConfirmAction = actionFn;
    document.getElementById("customConfirmModal").classList.remove("hidden");
  },

  closeConfirm: () => {
    document.getElementById("customConfirmModal").classList.add("hidden");
    IPOApp.pendingConfirmAction = null;
  },

  executeConfirm: () => {
    if (IPOApp.pendingConfirmAction) IPOApp.pendingConfirmAction();
    IPOApp.closeConfirm();
  },

  // --- THEME & SETUP ---
  initTheme: () => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    IPOApp.updateThemeIcon();
  },

  toggleTheme: () => {
    document.documentElement.classList.toggle("dark");
    localStorage.theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    IPOApp.updateThemeIcon();
    if (IPOApp.allData.length > 0) IPOApp.applyFilter();
  },

  updateThemeIcon: () => {
    const icon = document.querySelector("#themeToggle i");
    icon.className = document.documentElement.classList.contains("dark")
      ? "fas fa-sun text-yellow-300 text-sm"
      : "fas fa-moon text-white text-sm";
  },

  bindEvents: () => {
    document
      .getElementById("sellForm")
      .addEventListener("submit", IPOApp.handleJualSaham);
  },

  // --- API LOGIC ---
  fetchData: async () => {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = `
      <tr class="block md:table-row">
          <td colspan="5" class="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400 block md:table-cell border-none">
              <i class="fas fa-circle-notch fa-spin text-3xl text-indigo-400 mb-3 block"></i>
              <p class="font-medium animate-pulse">Menyinkronkan data...</p>
          </td>
      </tr>`;

    try {
      const userUrl = `${API_URL}?username=${encodeURIComponent(IPOApp.currentUser)}`;
      const response = await fetch(userUrl);
      const result = await response.json();
      if (result.status === "success") {
        IPOApp.allData = result.data;
        IPOApp.applyFilter();
        IPOApp.showToast("Data berhasil dimuat", "success");
      } else {
        IPOApp.showTableError("Gagal mengambil data dari server.");
        IPOApp.showToast("Gagal memuat data", "error");
      }
    } catch (error) {
      IPOApp.showTableError("Koneksi API terputus.");
      IPOApp.showToast("Kesalahan jaringan", "error");
    }
  },

  // --- FILTER & SORT LOGIC ---
  setFilter: (filterType) => {
    IPOApp.currentFilter = filterType;
    ["1M", "3M", "YTD", "ALL"].forEach((type) => {
      const btn = document.getElementById(`filter-${type}`);
      btn.className =
        type === filterType
          ? "flex-1 md:flex-none px-4 py-2 sm:py-1.5 text-xs sm:text-sm font-bold rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm transition-colors whitespace-nowrap"
          : "flex-1 md:flex-none px-4 py-2 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap";
    });
    IPOApp.applyFilter();
  },

  setSort: (sortType) => {
    IPOApp.currentSort = sortType;
    IPOApp.applyFilter();
  },

  applyFilter: () => {
    let processedData = [...IPOApp.allData];
    const today = new Date();
    let pastDate = new Date();

    if (IPOApp.currentFilter === "1M") pastDate.setMonth(today.getMonth() - 1);
    else if (IPOApp.currentFilter === "3M")
      pastDate.setMonth(today.getMonth() - 3);
    else if (IPOApp.currentFilter === "YTD")
      pastDate = new Date(today.getFullYear(), 0, 1);

    if (IPOApp.currentFilter !== "ALL") {
      processedData = processedData.filter((row) => {
        const dateStr = row["Tanggal Beli"] || row["Tanggal Input"];
        const rowDate = Utils.parseDateCustom(dateStr);
        return isNaN(rowDate) || rowDate >= pastDate;
      });
    }

    processedData.sort((a, b) => {
      const dateA = Utils.parseDateCustom(
        a["Tanggal Beli"] || a["Tanggal Input"],
      ).getTime();
      const dateB = Utils.parseDateCustom(
        b["Tanggal Beli"] || b["Tanggal Input"],
      ).getTime();
      const plA = Utils.getPLData(a).pl;
      const plB = Utils.getPLData(b).pl;

      if (IPOApp.currentSort === "newest") return dateB - dateA;
      if (IPOApp.currentSort === "oldest") return dateA - dateB;
      if (IPOApp.currentSort === "pl_high") return plB - plA;
      if (IPOApp.currentSort === "pl_low") return plA - plB;
      if (IPOApp.currentSort === "az")
        return (a["Ticker"] || "").localeCompare(b["Ticker"] || "");
      return 0;
    });

    IPOApp.renderTable(processedData);
    IPOApp.calculateDashboardAndCharts(processedData);
  },

  // --- RENDER TABEL ---
  renderTable: (data) => {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    if (data.length === 0) {
      tableBody.innerHTML = `
        <tr class="block md:table-row w-full">
            <td colspan="5" class="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400 block md:table-cell bg-slate-50/50 dark:bg-slate-800/50">
                <i class="fas fa-folder-open text-4xl text-slate-300 dark:text-slate-600 mb-3 block"></i>
                <span class="font-medium">Data portofolio kosong.</span>
            </td>
        </tr>`;
      return;
    }

    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.className =
        "block md:table-row w-full bg-white dark:bg-slate-800 mb-4 md:mb-0 rounded-xl md:rounded-none shadow-sm md:shadow-none border border-slate-200 dark:border-slate-700 md:border-b md:border-x-0 md:border-t-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors overflow-hidden";
      tr.innerHTML = IPOApp.generateRowHTML(row);
      tableBody.appendChild(tr);
    });
  },

  generateRowHTML: (row) => {
    const id = row["ID"];
    const ticker = row["Ticker"] || "-";
    const lot = parseInt(row["Lot Dapat"]) || 0;
    const hargaIPO = parseFloat(row["Harga IPO"]) || 0;
    const status = row["Status"] || "Hold";
    const tglBeli = row["Tanggal Beli"] || row["Tanggal Input"] || "-";
    const tglJual = row["Tanggal Jual"] || "-";

    const calc = Utils.getPLData(row);
    const plClass = calc.isProfit
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
    const plIcon = calc.isProfit ? "fa-arrow-trend-up" : "fa-arrow-trend-down";
    const bgPlClass = calc.isProfit
      ? "bg-emerald-50 dark:bg-emerald-900/20"
      : "bg-rose-50 dark:bg-rose-900/20";
    const hargaSaatIniClass =
      status === "Hold"
        ? calc.isProfit
          ? "text-emerald-600 dark:text-emerald-400"
          : calc.pl < 0
            ? "text-rose-600 dark:text-rose-400"
            : "text-slate-800 dark:text-slate-200"
        : "text-slate-800 dark:text-slate-200";

    const statusBadge =
      status === "Hold"
        ? `<span class="px-2.5 py-1 inline-flex text-[10px] sm:text-xs font-black rounded border bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">HOLD</span>`
        : `<span class="px-2.5 py-1 inline-flex text-[10px] sm:text-xs font-black rounded border bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600">SOLD</span>`;

    const displayHarga =
      status === "Sold"
        ? `Rp ${row["Harga Jual"]}`
        : `Rp ${row["Harga Saat Ini"] || hargaIPO}`;
    const actionBtn =
      status === "Hold"
        ? `<button onclick="IPOApp.openSellModal('${id}', '${ticker}')" class="w-full md:w-24 inline-flex justify-center items-center px-3 py-2.5 md:py-1.5 text-xs font-bold rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all"><i class="fas fa-hand-holding-usd mr-1.5"></i> JUAL</button>`
        : `<div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight text-center md:text-left w-full md:w-auto">Tgl Jual:<br/><span class="font-bold text-slate-700 dark:text-slate-300">${Utils.formatDate(tglJual)}</span></div>`;

    return `
      <td class="p-4 md:px-6 md:py-4 block md:table-cell border-b border-slate-100 dark:border-slate-700 md:border-none">
          <div class="flex justify-between items-center md:block">
              <span class="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Saham</span>
              <div class="text-right md:text-left">
                  <div class="text-base md:text-lg font-black text-indigo-700 dark:text-indigo-400 tracking-tight flex items-center justify-end md:justify-start gap-2">
                      ${ticker} <span class="md:hidden">${statusBadge}</span>
                  </div>
                  <div class="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-bold">${row["Underwriter"] || "-"}</div>
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
                  <div class="text-sm font-black ${plClass} flex items-center justify-end md:justify-start">
                      <i class="fas ${plIcon} mr-1.5 text-xs"></i>${Utils.formatRupiah(Math.abs(calc.pl))}
                  </div>
                  <div class="text-[10px] md:text-xs font-bold mt-1 ${plClass} ${bgPlClass} inline-block px-1.5 py-0.5 rounded">${calc.plPercent.toFixed(2)}%</div>
              </div>
          </div>
      </td>
      <td class="p-4 md:px-6 md:py-4 block md:table-cell align-middle bg-slate-100/50 dark:bg-slate-900/30 md:bg-transparent border-t border-slate-200 dark:border-slate-700 md:border-none">
          <div class="flex flex-col md:items-center justify-center gap-2">
              <div class="hidden md:block">${statusBadge}</div>
              ${actionBtn}
          </div>
          <div class="mt-3 md:mt-3 flex justify-center gap-5 md:gap-4 pt-3 md:pt-2 border-t border-slate-200 dark:border-slate-700">
              <button type="button" onclick="IPOApp.openFormModal('${id}')" class="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-xs font-bold"><i class="fas fa-edit text-sm"></i> <span class="md:hidden">Edit</span></button>
              <button type="button" onclick="IPOApp.deleteIPO('${id}', '${ticker}')" class="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-bold"><i class="fas fa-trash text-sm"></i> <span class="md:hidden">Hapus</span></button>
          </div>
      </td>`;
  },

  // --- KALKULASI METRIK & RENDERING GRAFIK ---
  calculateDashboardAndCharts: (data) => {
    let metrics = {
      invest: 0,
      unrealized: 0,
      realized: 0,
      count: data.length,
      winningTrades: 0,
      totalPlPercent: 0,
    };
    let chartLabels = [],
      chartPLData = [],
      chartInvestData = [],
      chartColors = [];

    data.forEach((row) => {
      const calc = Utils.getPLData(row);
      metrics.invest += calc.invest;

      if (row["Status"] === "Hold") metrics.unrealized += calc.pl;
      else if (row["Status"] === "Sold") metrics.realized += calc.pl;

      if (calc.isProfit && calc.pl > 0) metrics.winningTrades++;
      metrics.totalPlPercent += calc.plPercent;

      if (chartLabels.length < 15) {
        chartLabels.push(row["Ticker"]);
        chartPLData.push(calc.pl);
        chartInvestData.push(calc.invest);
        chartColors.push(
          calc.isProfit ? "rgba(16, 185, 129, 0.7)" : "rgba(244, 63, 94, 0.7)",
        );
      }
    });

    document.getElementById("dash-count").innerText = `${metrics.count} IPO`;
    document.getElementById("dash-investasi").innerText = Utils.formatRupiah(
      metrics.invest,
    );
    IPOApp.updateDashboardMetric("dash-unrealized", metrics.unrealized);
    IPOApp.updateDashboardMetric("dash-realized", metrics.realized);

    const winRate =
      metrics.count > 0 ? (metrics.winningTrades / metrics.count) * 100 : 0;
    const avgPl =
      metrics.count > 0 ? metrics.totalPlPercent / metrics.count : 0;

    document.getElementById("dash-winrate").innerText =
      `${winRate.toFixed(1)}%`;
    const avgEl = document.getElementById("dash-avgpl");
    avgEl.innerText = `${avgPl.toFixed(2)}%`;
    avgEl.className = `text-lg sm:text-xl font-black ${avgPl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`;

    IPOApp.renderCharts(chartLabels, chartPLData, chartInvestData, chartColors);
  },

  updateDashboardMetric: (elementId, value) => {
    const el = document.getElementById(elementId);
    el.innerText = Utils.formatRupiah(value);
    el.classList.remove(
      "text-rose-600",
      "dark:text-rose-400",
      "text-emerald-600",
      "dark:text-emerald-400",
      "text-purple-600",
      "dark:text-purple-400",
    );
    if (value >= 0) {
      el.classList.add(
        elementId.includes("unrealized")
          ? "text-emerald-600"
          : "text-purple-600",
      );
      el.classList.add(
        elementId.includes("unrealized")
          ? "dark:text-emerald-400"
          : "dark:text-purple-400",
      );
    } else {
      el.classList.add("text-rose-600", "dark:text-rose-400");
    }
  },

  renderCharts: (labels, plData, investData, colors) => {
    if (IPOApp.barChartInstance) IPOApp.barChartInstance.destroy();
    if (IPOApp.pieChartInstance) IPOApp.pieChartInstance.destroy();
    if (labels.length === 0) return;

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? "#334155" : "#e2e8f0";

    const ctxBar = document.getElementById("plBarChart").getContext("2d");
    IPOApp.barChartInstance = new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "P/L (Rupiah)",
            data: plData,
            backgroundColor: colors,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: gridColor },
            ticks: { callback: (value) => value / 1000 + "k" },
          },
        },
      },
    });

    const ctxPie = document
      .getElementById("allocationPieChart")
      .getContext("2d");
    IPOApp.pieChartInstance = new Chart(ctxPie, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: investData,
            backgroundColor: [
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
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? "#1e293b" : "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: { boxWidth: 12, font: { size: 10 } },
          },
        },
        cutout: "65%",
      },
    });
  },

  // --- MODAL & FORM LOGIC ---
  openFormModal: (id = null) => {
    const form = document.getElementById("ipoForm");
    const title = document.getElementById("formModalTitle");
    form.reset();
    IPOApp.toggleSellFields();

    if (id) {
      title.innerHTML =
        '<i class="fas fa-edit text-blue-500 dark:text-blue-400 mr-2"></i>Edit Data IPO';
      const data = IPOApp.allData.find((d) => d.ID === id);
      if (data) {
        document.getElementById("formId").value = data.ID;
        document.getElementById("ticker").value = data.Ticker;
        document.getElementById("nama").value = data["Nama Perusahaan"] || "";
        document.getElementById("underwriter").value = data.Underwriter || "";
        document.getElementById("harga_ipo").value = data["Harga IPO"];
        document.getElementById("lot_dapat").value = data["Lot Dapat"];
        document.getElementById("status_saham").value = data.Status;
        document.getElementById("tanggal_beli").value = Utils.toInputDateString(
          data["Tanggal Beli"] || data["Tanggal Input"],
        );

        if (data.Status === "Sold") {
          document.getElementById("form_harga_jual").value = data["Harga Jual"];
          document.getElementById("form_tanggal_jual").value =
            Utils.toInputDateString(data["Tanggal Jual"]);
          IPOApp.toggleSellFields();
        }
      }
    } else {
      title.innerHTML =
        '<i class="fas fa-plus-circle text-indigo-500 dark:text-indigo-400 mr-2"></i>Catat IPO Baru';
      document.getElementById("formId").value = "";
      document.getElementById("tanggal_beli").valueAsDate = new Date();
      document.getElementById("status_saham").value = "Hold";
    }

    const modal = document.getElementById("formModal");
    modal.classList.remove("hidden");
    setTimeout(
      () => modal.firstElementChild.classList.add("modal-enter-active"),
      10,
    );
  },

  closeFormModal: () => {
    const modal = document.getElementById("formModal");
    modal.firstElementChild.classList.remove("modal-enter-active");
    setTimeout(() => modal.classList.add("hidden"), 300);
  },

  toggleSellFields: () => {
    const status = document.getElementById("status_saham").value;
    const sellFields = document.getElementById("sellFields");
    const isSold = status === "Sold";
    sellFields.classList.toggle("hidden", !isSold);
    sellFields.classList.toggle("grid", isSold);
    document.getElementById("form_tanggal_jual").required = isSold;
    document.getElementById("form_harga_jual").required = isSold;
  },

  handleSimpanIPO: async (e) => {
    e.preventDefault();
    const form = document.getElementById("ipoForm");
    if (!form.checkValidity()) return form.reportValidity();

    const btnSubmit = document.getElementById("btnSubmitForm");
    IPOApp.setLoadingState(btnSubmit, true, "Menyimpan...");

    const id = document.getElementById("formId").value;
    const status = document.getElementById("status_saham").value;
    const payload = {
      action: id !== "" ? "edit" : "add",
      username: IPOApp.currentUser,
      id: id,
      ticker: document.getElementById("ticker").value.toUpperCase(),
      nama_perusahaan: document.getElementById("nama").value,
      underwriter: document.getElementById("underwriter").value,
      harga_ipo: document.getElementById("harga_ipo").value,
      lot_dapat: document.getElementById("lot_dapat").value,
      tanggal_beli: document.getElementById("tanggal_beli").value,
      status: status,
      harga_jual:
        status === "Sold"
          ? document.getElementById("form_harga_jual").value
          : "",
      tanggal_jual:
        status === "Sold"
          ? document.getElementById("form_tanggal_jual").value
          : "",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === "success") {
        IPOApp.closeFormModal();
        IPOApp.fetchData();
        IPOApp.showToast("Data berhasil disimpan", "success");
      } else {
        IPOApp.showToast("Gagal menyimpan: " + result.message, "error");
      }
    } catch (error) {
      IPOApp.showToast("Kesalahan koneksi internet.", "error");
    } finally {
      IPOApp.setLoadingState(
        btnSubmit,
        false,
        '<i class="fas fa-save mr-2"></i> Simpan Data',
      );
    }
  },

  deleteIPO: (id, ticker) => {
    IPOApp.openConfirm(
      `Apakah Anda yakin ingin menghapus data saham ${ticker}?`,
      async () => {
        try {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
              action: "delete",
              id: id,
              username: IPOApp.currentUser,
            }),
          });
          const result = await response.json();
          if (result.status === "success") {
            IPOApp.showToast("Data dihapus", "success");
            IPOApp.fetchData();
          } else {
            IPOApp.showToast("Gagal menghapus: " + result.message, "error");
          }
        } catch (error) {
          IPOApp.showToast("Terjadi kesalahan koneksi.", "error");
        }
      },
    );
  },

  openSellModal: (id, ticker) => {
    document.getElementById("sellId").value = id;
    document.getElementById("sellTicker").innerText = ticker;
    document.getElementById("sellPrice").value = "";
    document.getElementById("sellDate").valueAsDate = new Date();
    const modal = document.getElementById("sellModal");
    modal.classList.remove("hidden");
    setTimeout(
      () => modal.firstElementChild.classList.add("modal-enter-active"),
      10,
    );
  },

  closeSellModal: () => {
    const modal = document.getElementById("sellModal");
    modal.firstElementChild.classList.remove("modal-enter-active");
    setTimeout(() => modal.classList.add("hidden"), 300);
  },

  handleJualSaham: async (e) => {
    e.preventDefault();
    const btnConfirm = document.getElementById("btnConfirmSell");
    IPOApp.setLoadingState(btnConfirm, true, "Memproses...");

    const payload = {
      action: "update",
      username: IPOApp.currentUser,
      id: document.getElementById("sellId").value,
      harga_jual: document.getElementById("sellPrice").value,
      tanggal_jual: document.getElementById("sellDate").value,
      status: "Sold",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === "success") {
        IPOApp.closeSellModal();
        IPOApp.fetchData();
        IPOApp.showToast("Saham berhasil dijual!", "success");
      } else {
        IPOApp.showToast("Gagal update: " + result.message, "error");
      }
    } catch (error) {
      IPOApp.showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      IPOApp.setLoadingState(
        btnConfirm,
        false,
        '<i class="fas fa-check mr-1.5"></i> Jual',
      );
    }
  },

  setLoadingState: (buttonEl, isLoading, text) => {
    buttonEl.disabled = isLoading;
    buttonEl.innerHTML = isLoading
      ? `<i class="fas fa-spinner fa-spin mr-2"></i>${text}`
      : text;
    buttonEl.classList.toggle("opacity-70", isLoading);
    buttonEl.classList.toggle("cursor-not-allowed", isLoading);
  },

  showTableError: (message) => {
    document.getElementById("tableBody").innerHTML = `
      <tr class="block md:table-row w-full">
          <td colspan="5" class="px-6 py-8 text-center text-rose-500 font-medium bg-rose-50 dark:bg-rose-900/20 block md:table-cell">
              <i class="fas fa-exclamation-triangle mr-2"></i>${message}
          </td>
      </tr>`;
  },
};

// Start App
document.addEventListener("DOMContentLoaded", IPOApp.init);
