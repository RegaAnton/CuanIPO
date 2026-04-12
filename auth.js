/**
 * AUTH.JS - Authentication module
 * Handles login and registration
 * 
 * Dependencies:
 * - constants.js  (Configuration and constants)
 * - utils.js      (Utility functions including hashPassword)
 * - ui.js         (DOM manipulation including showToast)
 * - api.js        (API calls management)
 */

const AuthApp = {
  /**
   * Initialize authentication page
   */
  init: () => {
    AuthApp.checkRedirect();
    AuthApp.bindEvents();
  },

  /**
   * Check if user is already logged in - redirect to index if true
   */
  checkRedirect: () => {
    if (localStorage.getItem(CONFIG.STORAGE_KEYS.USER)) {
      window.location.href = "index.html";
    }
  },

  /**
   * Bind event listeners for forms
   */
  bindEvents: () => {
    const loginForm = document.getElementById(CONFIG.SELECTORS.ipoForm) ||
                      document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", AuthApp.handleLogin);
    }

    const registerForm = document.getElementById(CONFIG.SELECTORS.sellForm) ||
                        document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", AuthApp.handleRegister);
    }
  },

  /**
   * Handle login form submission
   * @param {Event} e - Form submit event
   */
  handleLogin: async (e) => {
    e.preventDefault();

    const usernameEl = document.getElementById("authUsername");
    const passwordEl = document.getElementById("authPassword");
    const btnLogin = document.getElementById("btnLoginSubmit");

    if (!usernameEl || !passwordEl || !btnLogin) return;

    const username = usernameEl.value.trim();
    const rawPassword = passwordEl.value;

    // Validation
    if (!username || !rawPassword) {
      UI.showToast(CONFIG.MESSAGES.DEFAULT.requiredError, "error");
      return;
    }

    // Set loading state
    UI.setButtonLoading(btnLogin, true, "Memproses...");

    try {
      // Hash password
      const hashedPassword = await Utils.hashPassword(rawPassword);

      // Call API
      const result = await API.login(username, hashedPassword);

      if (result.status === "success") {
        UI.showToast(CONFIG.MESSAGES.AUTH.loginSuccess, "success");
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, username);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        UI.showToast(result.message || CONFIG.MESSAGES.AUTH.loginError, "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      UI.showToast(CONFIG.MESSAGES.AUTH.loginError, "error");
    } finally {
      // Reset loading state
      UI.setButtonLoading(btnLogin, false, "Login");
    }
  },

  /**
   * Handle register form submission
   * @param {Event} e - Form submit event
   */
  handleRegister: async (e) => {
    e.preventDefault();

    const usernameEl = document.getElementById("regUsername");
    const passwordEl = document.getElementById("regPassword");
    const btnRegister = document.getElementById("btnRegisterSubmit");

    if (!usernameEl || !passwordEl || !btnRegister) return;

    const username = usernameEl.value.trim();
    const rawPassword = passwordEl.value;

    // Validation
    if (!username || !rawPassword) {
      UI.showToast(CONFIG.MESSAGES.DEFAULT.requiredError, "error");
      return;
    }

    // Set loading state
    UI.setButtonLoading(btnRegister, true, "Mendaftar...");

    try {
      // Hash password
      const hashedPassword = await Utils.hashPassword(rawPassword);

      // Call API
      const result = await API.register(username, hashedPassword);

      if (result.status === "success") {
        UI.showToast(CONFIG.MESSAGES.AUTH.registerSuccess, "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        UI.showToast(result.message || CONFIG.MESSAGES.AUTH.registerError, "error");
      }
    } catch (error) {
      console.error("Register error:", error);
      UI.showToast(CONFIG.MESSAGES.AUTH.registerError, "error");
    } finally {
      // Reset loading state
      UI.setButtonLoading(btnRegister, false, "Daftar Sekarang");
    }
  },
};

// ===== INITIALIZE AUTH PAGE =====
document.addEventListener("DOMContentLoaded", AuthApp.init);
