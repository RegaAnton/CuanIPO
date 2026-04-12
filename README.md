# 📈 CuanIPO - IPO Portfolio Manager

Aplikasi web untuk mengelola portfolio IPO dengan dashboard analytics, tracking P&L, dan visualisasi data real-time.

## ✨ Fitur Utama

- 🔐 **Authentication** - Login & Register dengan password hashing SHA-256
- 📊 **Dashboard** - Ringkasan profit/loss, win rate, total investasi
- 📈 **Visualisasi** - Bar chart (P&L) dan pie chart (alokasi portfolio)
- ➕ **CRUD** - Tambah, edit, hapus, jual IPO
- 🏷️ **Status Tracking** - Tracking hold/sold otomatis
- 🎨 **Dark Mode** - Theme toggle light/dark
- 📱 **Responsive** - Mobile, tablet, desktop compatible

---

## 🛠️ Teknologi yang Digunakan

| Aspek             | Technology                                      |
| ----------------- | ----------------------------------------------- |
| **Frontend**      | HTML5, CSS3 (Tailwind), Vanilla JavaScript ES6+ |
| **Visualization** | Chart.js                                        |
| **Backend**       | Google Apps Script                              |
| **Database**      | Google Sheets                                   |
| **Architecture**  | Modular JavaScript (7 modules)                  |

---

## 📋 Prasyarat Instalasi

- ✅ Browser modern (Chrome, Firefox, Safari, Edge)
- ✅ Google Account (untuk Sheets & Apps Script)
- ✅ Text editor (VS Code, Sublime, dll)
- ✅ Git (untuk clone repo)

---

## 📁 Struktur Project

```
CuanIPO/
├── index.html              # Dashboard utama
├── login.html              # Halaman login
├── register.html           # Halaman registrasi
├── style.css               # Styling custom
├── constants.js            # Config & konstanta
├── utils.js                # Utility functions
├── api.js                  # API management
├── ui.js                   # DOM & UI components
├── charts.js               # Chart rendering
├── app.js                  # Main logic
├── auth.js                 # Authentication
├── README.md               # Dokumentasi (file ini)
├── CONTRIBUTING.md         # Contribution guide
├── CHANGELOG.md            # Version history
├── LICENSE                 # MIT License
└── .gitignore              # Git ignore rules
```

---

## ⚙️ Setup & Instalasi

### Step 1: Siapkan Google Sheets

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru (atau gunakan yang sudah ada)
3. Buat dua sheets dengan nama: **"Portfolio"** dan **"Users"**

**Portfolio sheet - Header row:**

```
ID | Tanggal Beli | Ticker | Nama Perusahaan | Underwriter | Harga IPO | Lot | Status | Tgl Jual | Harga Jual | Username
```

**Users sheet - Header row:**

```
Username | Password | Tgl Daftar
```

### Step 2: Deploy Google Apps Script

1. Di spreadsheet → **Extensions → Apps Script**
2. Hapus kode default, paste kode di bagian "Backend Code" (bawah)
3. **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: (pilih akun Anda)
   - Who has access: **Anyone**
4. Copy deployment URL → simpan untuk step selanjutnya

### Step 3: Update Konfigurasi

Buka file `constants.js` dan update:

```javascript
const CONFIG = {
  // Ganti dengan Apps Script deployment URL dari step 2
  API_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",

  SHEETS: {
    DATA: "Portfolio",
    USERS: "Users",
  },

  // ... config lainnya tidak perlu diubah
};
```

### Step 4: Buka Aplikasi

- Buka file `index.html` di browser
- Register akun baru
- Mulai tracking IPO Anda!

---

## 💡 Contoh Penggunaan

### Menambah IPO Baru

1. Klik tombol **"+ Tambah IPO"**
2. Isi form:
   - Ticker (contoh: BBRI)
   - Nama Perusahaan (contoh: Bank Rakyat Indonesia)
   - Underwriter (contoh: CIMB Niaga)
   - Harga IPO per lot (contoh: 3850)
   - Jumlah lot (contoh: 10)
3. Klik **"Simpan"** → Data otomatis tersimpan ke Google Sheets

### Mencatat Penjualan IPO

1. Klik tombol **"Jual"** pada saham yang ingin dijual
2. Isi:
   - Tanggal penjualan
   - Harga jual per lot
3. Klik **"Catat Penjualan"**
4. P&L otomatis terhitung dan ditampilkan

### Filter & Sort Data

- **Filter:** Dropdown "Status" → Pilih "Holding" atau "Sold"
- **Sort:** Klik header kolom untuk sort (Ticker, Harga Jual, P&L, dll)
- **Charts:** Update otomatis sesuai data yang ditampilkan

### Contoh Data untuk Testing

Tambahkan data dummy untuk test:

| Ticker | Nama                  | Underwriter   | Harga IPO | Lot | Tanggal Beli |
| ------ | --------------------- | ------------- | --------- | --- | ------------ |
| BBRI   | Bank Rakyat Indonesia | CIMB Niaga    | 3850      | 10  | 2024-01-15   |
| MEGA   | Bank Mega             | Goldman Sachs | 5500      | 5   | 2024-02-01   |
| INDF   | Indofood              | BCA Sekuritas | 8000      | 8   | 2024-02-10   |

---

## 📦 Backend Code (Google Apps Script)

Paste kode ini di Google Apps Script editor:

```javascript
const SHEET_DATA = "Portfolio";
const SHEET_USERS = "Users";

function doGet(e) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DATA);
  const rows = sheet.getDataRange().getValues();
  const username = e.parameter.username || "";
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][10] === username) {
      data.push(formatRow(rows[0], rows[i]));
    }
  }

  return respond("success", data);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const payload = JSON.parse(e.postData.contents);
  const action = payload.action || "";

  try {
    if (action === "login") return handleLogin(ss, payload);
    if (action === "register") return handleRegister(ss, payload);
    if (action === "add") return handleAdd(ss, payload);
    if (action === "update") return handleUpdate(ss, payload);
    if (action === "delete") return handleDelete(ss, payload);
    if (action === "edit") return handleEdit(ss, payload);

    return respond("error", "Aksi tidak dikenali");
  } catch (err) {
    return respond("error", "Server error: " + err.message);
  }
}

function handleLogin(ss, data) {
  const sheet = ss.getSheetByName(SHEET_USERS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username && rows[i][1] === data.password) {
      return respond("success", "Login berhasil");
    }
  }
  return respond("error", "Username atau password salah");
}

function handleRegister(ss, data) {
  const sheet = ss.getSheetByName(SHEET_USERS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.username) {
      return respond("error", "Username sudah terdaftar");
    }
  }

  sheet.appendRow([data.username, data.password, new Date()]);
  return respond("success", "Registrasi berhasil");
}

function handleAdd(ss, data) {
  const sheet = ss.getSheetByName(SHEET_DATA);
  const id = "IPO-" + Date.now();

  sheet.appendRow([
    id,
    data.tanggal_beli || "",
    data.ticker || "",
    data.nama_perusahaan || "",
    data.underwriter || "",
    data.harga_ipo || 0,
    data.lot_dapat || 0,
    "Hold",
    "",
    "",
    data.username || "",
  ]);

  return respond("success", "Data ditambahkan");
}

function handleUpdate(ss, data) {
  const sheet = ss.getSheetByName(SHEET_DATA);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][10] === data.username) {
      sheet.getRange(i + 1, 8).setValue("Sold");
      sheet.getRange(i + 1, 9).setValue(data.tanggal_jual || "");
      sheet.getRange(i + 1, 10).setValue(data.harga_jual || 0);
      return respond("success", "Saham terjual");
    }
  }
  return respond("error", "Data tidak ditemukan");
}

function handleDelete(ss, data) {
  const sheet = ss.getSheetByName(SHEET_DATA);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][10] === data.username) {
      sheet.deleteRow(i + 1);
      return respond("success", "Data dihapus");
    }
  }
  return respond("error", "Data tidak ditemukan");
}

function handleEdit(ss, data) {
  const sheet = ss.getSheetByName(SHEET_DATA);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][10] === data.username) {
      sheet.getRange(i + 1, 2).setValue(data.tanggal_beli || "");
      sheet.getRange(i + 1, 3).setValue(data.ticker || "");
      sheet.getRange(i + 1, 4).setValue(data.nama_perusahaan || "");
      sheet.getRange(i + 1, 5).setValue(data.underwriter || "");
      sheet.getRange(i + 1, 6).setValue(data.harga_ipo || 0);
      sheet.getRange(i + 1, 7).setValue(data.lot_dapat || 0);
      return respond("success", "Data diperbarui");
    }
  }
  return respond("error", "Data tidak ditemukan");
}

function formatRow(headers, row) {
  let obj = {};
  for (let i = 0; i < headers.length; i++) {
    obj[headers[i]] = row[i];
  }
  return obj;
}

function respond(status, data) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: status, data: data }),
  ).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🤝 Kontribusi

Kami welcome kontribusi! Silahkan lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk detail lengkap.

**Quick steps:**

1. Fork repository
2. Buat branch baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m "Add: deskripsi"`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## 📄 Lisensi

Project ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detail.

Anda bebas menggunakan, memodifikasi, dan mendistribusikan aplikasi ini untuk keperluan komersial maupun non-komersial.

---

## 📞 Support

Butuh bantuan? Buka issue di GitHub atau hubungi repository owner.

---

**Happy tracking! 🚀**
