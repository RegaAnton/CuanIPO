/**
 * CHARTS.JS - Chart rendering and management
 */

const Charts = {
  barChartInstance: null,
  pieChartInstance: null,

  /**
   * Render both bar and pie charts
   * @param {Array<string>} labels - Stock tickers
   * @param {Array<number>} plData - P&L values
   * @param {Array<number>} investData - Investment values
   * @param {Array<string>} colors - Colors for each item
   */
  render: (labels, plData, investData, colors) => {
    if (labels.length === 0) return;

    Charts.renderBarChart(labels, plData, colors);
    Charts.renderPieChart(labels, investData);
  },

  /**
   * Render P&L bar chart
   * @private
   * @param {Array<string>} labels - Stock tickers
   * @param {Array<number>} plData - P&L values
   * @param {Array<string>} colors - Colors for bars
   */
  renderBarChart: (labels, plData, colors) => {
    if (Charts.barChartInstance) Charts.barChartInstance.destroy();

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark
      ? CONFIG.CHART.colors.darkGradient
      : CONFIG.CHART.colors.lightGradient;

    const ctx = document.getElementById(CONFIG.SELECTORS.plBarChart);
    if (!ctx) return;

    Charts.barChartInstance = new Chart(ctx.getContext("2d"), {
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
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: gridColor },
            ticks: {
              callback: (value) => {
                const absValue = Math.abs(value);
                if (absValue >= 1000000)
                  return (value / 1000000).toFixed(0) + "M";
                if (absValue >= 1000) return (value / 1000).toFixed(0) + "k";
                return value;
              },
            },
          },
        },
      },
    });
  },

  /**
   * Render allocation doughnut pie chart
   * @private
   * @param {Array<string>} labels - Stock tickers
   * @param {Array<number>} investData - Investment values
   */
  renderPieChart: (labels, investData) => {
    if (Charts.pieChartInstance) Charts.pieChartInstance.destroy();

    const isDark = document.documentElement.classList.contains("dark");

    const ctx = document.getElementById(CONFIG.SELECTORS.allocationPieChart);
    if (!ctx) return;

    Charts.pieChartInstance = new Chart(ctx.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: investData,
            backgroundColor: CONFIG.CHART.colors.doughnutColors,
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

  /**
   * Destroy all chart instances
   */
  destroyAll: () => {
    if (Charts.barChartInstance) {
      Charts.barChartInstance.destroy();
      Charts.barChartInstance = null;
    }
    if (Charts.pieChartInstance) {
      Charts.pieChartInstance.destroy();
      Charts.pieChartInstance = null;
    }
  },
};
