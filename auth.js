const AuthApp = {
  // PENTING: GANTI DENGAN URL API APPS SCRIPT KAMU
  API_URL:
    "https://script.google.com/macros/s/AKfycbwscq9g3lC8OsdBlQFtmSm48cL65w-WwV7uAIYjdRU5s_rHyXLRRR-vCFK2dhnbXZ5GDQ/exec",

  init: () => {
    // Jika sudah login, paksa pindah ke index.html
    if (localStorage.getItem("cuanIpoUser")) {
      window.location.href = "index.html";
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", AuthApp.handleLogin);

    const registerForm = document.getElementById("registerForm");
    if (registerForm)
      registerForm.addEventListener("submit", AuthApp.handleRegister);
  },

  // Fungsi untuk mengenkripsi (Hashing SHA-256) password
  hashPassword: async (password) => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  },

  handleLogin: async (e) => {
    e.preventDefault();
    const username = document.getElementById("authUsername").value.trim();
    const rawPassword = document.getElementById("authPassword").value;
    const btn = document.getElementById("btnLoginSubmit");

    if (!username || !rawPassword)
      return AuthApp.showToast("Username dan Password wajib diisi!", "error");

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...`;
    btn.classList.add("opacity-70", "cursor-not-allowed");

    try {
      // Enkripsi password sebelum dikirim ke Google Sheets
      const hashedPassword = await AuthApp.hashPassword(rawPassword);

      const response = await fetch(AuthApp.API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "login",
          username: username,
          password: hashedPassword,
        }),
      });
      const result = await response.json();

      if (result.status === "success") {
        AuthApp.showToast("Login Berhasil! Mengalihkan...", "success");
        localStorage.setItem("cuanIpoUser", username);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        AuthApp.showToast(result.message, "error");
      }
    } catch (error) {
      AuthApp.showToast("Gagal terhubung ke server.", "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `Login`;
      btn.classList.remove("opacity-70", "cursor-not-allowed");
    }
  },

  handleRegister: async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUsername").value.trim();
    const rawPassword = document.getElementById("regPassword").value;
    const btn = document.getElementById("btnRegisterSubmit");

    if (!username || !rawPassword)
      return AuthApp.showToast("Username dan Password wajib diisi!", "error");

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Mendaftar...`;
    btn.classList.add("opacity-70", "cursor-not-allowed");

    try {
      // Enkripsi password sebelum disimpan ke Google Sheets
      const hashedPassword = await AuthApp.hashPassword(rawPassword);

      const response = await fetch(AuthApp.API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "register",
          username: username,
          password: hashedPassword,
        }),
      });
      const result = await response.json();

      if (result.status === "success") {
        AuthApp.showToast("Registrasi Berhasil! Silakan Login.", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        AuthApp.showToast(result.message, "error");
      }
    } catch (error) {
      AuthApp.showToast("Gagal terhubung ke server.", "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `Daftar Sekarang`;
      btn.classList.remove("opacity-70", "cursor-not-allowed");
    }
  },

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
};

document.addEventListener("DOMContentLoaded", AuthApp.init);
