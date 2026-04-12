# CONTRIBUTING.md

Terima kasih sudah tertarik berkontribusi pada CuanIPO! 🎉

## Code of Conduct

- Bersikap hormat dan inklusif
- Tidak ada harassment atau diskriminasi
- Fokus pada constructive feedback

## Cara Berkontribusi

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/CuanIPO.git
cd CuanIPO
```

### 2. Buat Branch Baru

```bash
git checkout -b feature/your-feature-name
```

### 3. Buat Perubahan

- Ikuti code style yang sudah ada
- Tambah comments untuk logic kompleks
- Update README jika ada fitur baru

### 4. Commit dengan Pesan Jelas

```bash
git commit -m "Add: new feature description"
git commit -m "Fix: bug description"
git commit -m "Refactor: code improvement"
git commit -m "Docs: documentation update"
```

### 5. Push & Create Pull Request

```bash
git push origin feature/your-feature-name
```

Buat PR dengan deskripsi detail tentang perubahan Anda.

## Commit Message Convention

```
Type: Short description

- Detail perubahan 1
- Detail perubahan 2

Fixes #123
```

**Types:**

- `feat` - Fitur baru
- `fix` - Bug fix
- `refactor` - Code improvement
- `docs` - Dokumentasi
- `style` - Formatting (tidak ada logic change)
- `test` - Test addition/update
- `chore` - Maintenance

## Code Style Guidelines

### JavaScript

- Gunakan consistent indentation (2 spaces)
- Gunakan camelCase untuk variables
- Gunakan UPPERCASE untuk constants
- Add JSDoc comments untuk functions

```javascript
/**
 * Deskripsi function
 * @param {type} paramName - Deskripsi parameter
 * @returns {type} Deskripsi return value
 */
function myFunction(paramName) {
  // implementation
}
```

### HTML/CSS

- Semantic HTML5
- BEM naming convention untuk CSS classes
- Mobile-first approach

## Testing Checklist

Sebelum submit PR, ensure:

- [ ] Login/Register berfungsi
- [ ] Add/Edit/Delete IPO berfungsi
- [ ] Filter dan Sort bekerja
- [ ] Charts render dengan benar
- [ ] Dark mode works
- [ ] Responsive design (test di mobile)
- [ ] No console errors
- [ ] API calls berhasil

## Pull Request Checklist

- [ ] PR title jelas dan deskriptif
- [ ] Description menjelaskan changes
- [ ] Code follows style guidelines
- [ ] Tests passed (if applicable)
- [ ] Documentation updated
- [ ] No breaking changes (untuk minor updates)

## Reporting Issues

Jika menemukan bug:

1. Check existing issues (jangan duplikat)
2. Berikan minimal reproducible example
3. Include browser/environment info
4. Berikan expected vs actual behavior

**Bug Report Template:**

```
### Description
Deskripsi singkat bug

### Steps to Reproduce
1. Langkah 1
2. Langkah 2
3. Langkah 3

### Expected Behavior
Apa yang seharusnya terjadi

### Actual Behavior
Apa yang benar-benar terjadi

### Environment
- Browser: Chrome 90
- OS: Windows 10
- Device: Desktop
```

## Questions?

Buka discussion atau issue untuk bertanya. Saya siap membantu! 😊

---

Happy coding! 🚀

# 🤝 Contributing to CuanIPO

Terima kasih telah ingin berkontribusi pada CuanIPO! Kami sangat menghargai setiap kontribusi. Panduan ini akan membantu Anda memulai.

## Code of Conduct

Kami memiliki Code of Conduct yang berlaku untuk semua kontributor. Silakan baca [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) sebelum bertransaksi.

---

## Getting Started

### 1. Fork Repository

```bash
# Kunjungi https://github.com/username/cuaniPO
# Klik tombol "Fork" di kanan atas
```

### 2. Clone Fork Anda

```bash
git clone https://github.com/YOUR_USERNAME/cuaniPO.git
cd cuanIPO
```

### 3. Buat Branch Baru

```bash
# Untuk bug fixes
git checkout -b bugfix/deskripsi-singkat

# Untuk features
git checkout -b feature/nama-feature

# Untuk improvements
git checkout -b improvement/deskripsi-singkat
```

### 4. Setup Development Environment

```bash
# Tidak ada setup khusus, langsung buka di browser
# Atau gunakan local server:

# Python 3
python -m http.server 8000

# Node.js
npx http-server

# Akses http://localhost:8000
```

---

## Development Guidelines

### Code Style

#### JavaScript

```javascript
// ✅ DO: Use camelCase untuk variables
const myVariable = "value";

// ❌ DON'T: Gunakan snake_case
const my_variable = "value";

// ✅ DO: Use descriptive names
const userAuthStatus = checkAuthStatus();

// ❌ DON'T: Single letter variables (kecuali loop)
const x = getUserData();

// ✅ DO: Add comments untuk complex logic
const pl = invest > 0 ? (profit / invest) * 100 : 0;

// ✅ DO: Use template literals
const message = `Hello, ${userName}!`;

// ❌ DON'T: String concatenation
const message = "Hello, " + userName + "!";
```

#### HTML

```html
<!-- ✅ DO: Use semantic HTML -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>

<!-- ❌ DON'T: Gunakan divs untuk semuanya -->
<div>
  <div>...</div>
</div>

<!-- ✅ DO: Use descriptive IDs & classes -->
<button id="btnLoginSubmit" class="btn btn-primary">
  <!-- ❌ DON'T: Gunakan generic names -->
  <button id="btn1" class="btn"></button>
</button>
```

#### CSS

```css
/* ✅ DO: Use Tailwind utility classes */
<div class="flex items-center gap-2 text-lg font-bold">

/* ❌ DON'T: Inline styles jika bisa pakai Tailwind */
<div style="display: flex; gap: 8px;">

/* ✅ DO: Custom CSS hanya untuk special cases */
.modal-enter {
  opacity: 0;
  transform: scale(0.95);
}

/* ❌ DON'T: Duplicate Tailwind styles */
.container {
  display: flex;
  justify-content: center;
  /* Ini sudah ada di Tailwind! */
}
```

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Type:**

- `feat:` - Feature baru
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test changes
- `chore:` - Build, dependencies, etc

**Examples:**

```
feat: Add dark mode support to dashboard

Implemented theme toggle functionality using localStorage
to persist user preference across sessions.

Fixes #123
```

```
fix: Correct P&L calculation for sold positions

Previous calculation was using wrong price for sold items.
Now correctly uses actual sell price instead of current price.

Closes #456
```

### Pull Request Process

1. **Ensure your fork is sync** dengan main repository:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push local branch** ke fork Anda:

   ```bash
   git push origin feature/nama-feature
   ```

3. **Open Pull Request** di GitHub:
   - Deskripsi yang jelas tentang yang Anda ubah
   - Reference issue jika ada (#123)
   - Screenshot/video untuk UI changes
   - Testing steps yang dilakukan

4. **PR Template:**

   ```markdown
   ## Description

   Penjelasan singkat tentang perubahan

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## How Has This Been Tested?

   Jelaskan testing yang Anda lakukan

   ## Checklist

   - [ ] Kode sudah di-review
   - [ ] Tidak ada console errors
   - [ ] Tested di mobile
   - [ ] Tested di dark mode
   - [ ] Documentation updated
   - [ ] No breaking changes

   ## Screenshots (jika applicable)

   [Tambahkan screenshot di sini]
   ```

---

## Testing

### Manual Testing Checklist

Sebelum submit PR, pastikan:

- [ ] **Functionality Tests**
  - [ ] Feature berfungsi seperti expected
  - [ ] Tidak ada console errors
  - [ ] No UI breaks

- [ ] **Browser Compatibility**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)

- [ ] **Responsive Design**
  - [ ] Desktop (1920px+)
  - [ ] Tablet (768px - 1024px)
  - [ ] Mobile (320px - 767px)

- [ ] **Dark Mode**
  - [ ] Test di light mode
  - [ ] Test di dark mode
  - [ ] Verify colors readability

- [ ] **Accessibility**
  - [ ] Keyboard navigation works
  - [ ] Form labels present
  - [ ] Color contrast sufficient

### Bug Reporting

Found a bug? Report di GitHub Issues dengan:

**Title:** Deskripsi singkat bug

```
Dark mode toggle not working on mobile
```

**Description:**

```markdown
## Describe the bug

Penjelasan apa yang terjadi yang tidak seharusnya.

## To Reproduce

1. Buka aplikasi di iPhone
2. Klik theme toggle button
3. Mode tidak berubah ke dark

## Expected behavior

Seharusnya background berubah ke dark

## Environment

- Browser: Safari on iOS 17
- Device: iPhone 14
- OS: iOS 17.2

## Screenshots

[Tambahkan screenshot/video]
```

---

## File Organization

### Jika menambah fitur baru:

```
cuanIPO/
├── index.html       # Update jika ada UI baru
├── login.html       # Update jika ada UI auth baru
├── register.html
├── app.js           # Update untuk logika utama
├── auth.js          # Update untuk auth changes
├── style.css        # Update untuk styling
└── README.md        # Update dokumentasi
```

### Naming Conventions

- **HTML files:** lowercase, no spaces

  ```
  ✅ portfolio-detail.html
  ❌ Portfolio Details.html
  ```

- **JavaScript functions:** camelCase

  ```
  ✅ calculateProfitLoss()
  ❌ calculate_profit_loss()
  ```

- **CSS classes:** kebab-case

  ```
  ✅ btn-primary, card-container
  ❌ btnPrimary, CardContainer
  ```

- **IDs:** descriptive, camelCase
  ```
  ✅ id="btnSubmit", id="userProfile"
  ❌ id="btn1", id="profile-section"
  ```

---

## Documentation

### Updating README

Jika menambah fitur, update:

- [ ] README.md - Tambah di Features section
- [ ] README.md - Update Struktur Project jika ada file baru
- [ ] CONTRIBUTING.md - Update guidelines jika ada new conventions

### Code Comments

```javascript
// ✅ DO: Explain WHY, not WHAT
// Using localStorage instead of sessionStorage to persist
// user preference across browser sessions
const savedTheme = localStorage.getItem("theme");

// ❌ DON'T: State obvious things
// Set the saved theme
const savedTheme = localStorage.getItem("theme");

// ✅ DO: Use JSDoc untuk functions
/**
 * Calculate profit/loss percentage
 * @param {number} profit - Profit amount
 * @param {number} investment - Investment amount
 * @returns {number} P&L percentage
 */
function calculatePLPercent(profit, investment) {
  return investment > 0 ? (profit / investment) * 100 : 0;
}
```

---

## Communication

### Getting Help

- 💬 **GitHub Discussions** - Untuk questions & ideas
- 🐛 **GitHub Issues** - Untuk bugs & features
- 📧 **Email** - security@cuaniPO.dev untuk security issues
- 💬 **Discord** (TBA) - Real-time discussion

### Reporting Issues

**Jangan:**

- ❌ Duplicate issues - search dulu
- ❌ Feature requests di bug reports
- ❌ Off-topic discussions
- ❌ Cross-posting di multiple channels

**Lakukan:**

- ✅ Cek existing issues & discussions
- ✅ Gunakan template yang disediakan
- ✅ Provide sufficient detail
- ✅ One issue per problem

---

## Review Process

### What to Expect

1. **Initial Review** (1-3 hari)
   - Maintainer akan review PR
   - Request untuk changes jika perlu

2. **Code Review**
   - Check code quality
   - Verify functionality
   - Test coverage

3. **Approval & Merge**
   - Maintainer approve PR
   - Merge ke main branch
   - Close related issues

### Common Feedback

- "Can you add a test untuk ini?" - Jangan khawatir, kami akan guide
- "Simplify dengan Tailwind utils" - Refactor untuk lebih clean
- "Update docs" - Pastikan dokumentasi lengkap

---

## Recognition

Kami menghargai setiap kontribusi! Contributors akan:

- ✅ Listed di README.md
- ✅ Credited di release notes
- ✅ Invited ke contributors team (jika aktif)

---

## Tips untuk Success

1. **Mulai Kecil** - PRs kecil lebih mudah di-review
2. **Communicate Early** - Buka discussion sebelum besar PR
3. **Test Thoroughly** - Manual test sebelum submit
4. **Read Feedback** - Maintainers memberi helpful info
5. **Be Patient** - Maintenance volunteer-based, bersabar ya

---

## Need Help?

Stuck? Ada beberapa cara untuk mendapat bantuan:

1. **Search Issues** - Mungkin sudah ada solution
2. **Read Docs** - README & comments sudah lengkap
3. **Open Discussion** - Tanya di GitHub Discussions
4. **Email** - support@cuaniPO.dev untuk bantuan general

---

**Happy Contributing! 🎉**

Terima kasih telah membuat CuanIPO lebih baik!

---

_Last Updated: April 12, 2026_
