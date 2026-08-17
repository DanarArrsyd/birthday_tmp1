# Scrapbook Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti tema halaman ulang tahun Dinar dari playful pink menjadi scrapbook kraft, dengan struktur sampul-yang-dibuka lalu lima lembar yang digeser horizontal.

**Architecture:** Sampul (berisi kue + 16 lilin) berada di luar wadah geser. Meniup lilin memicu animasi sampul terbuka, lalu menyerahkan kendali ke deck. Deck memakai `scroll-snap` native — bukan drag berbasis pointer — sehingga momentum, navigasi keyboard, dan pembaca layar berfungsi tanpa disimulasikan. Rantai kendali satu arah: `CAKE` → `COVER` → `DECK`; tidak ada modul yang memanggil balik ke hulu.

**Tech Stack:** HTML/CSS/JS vanilla. Tanpa framework, tanpa build tool, tanpa library. Web Audio API untuk sintesis nada dan analyser mikrofon. Canvas 2D untuk partikel. Google Fonts via `<link>`.

## Global Constraints

Setiap task tunduk pada seluruh butir di bawah ini.

- **Tanpa dependency eksternal.** Dilarang menambah framework, library animasi, library confetti, atau build tool.
- **Tanpa berkas aset gambar untuk dekorasi.** Tekstur kertas dibuat dari `feTurbulence` SVG sebagai `data:` URI inline. Hanya foto pengguna yang boleh menjadi berkas gambar.
- **Tiga berkas saja:** `index.html`, `style.css`, `script.js`. Spec §11 mengunci ini; `script.js` dipecah menjadi modul beranotasi di dalam satu berkas, bukan berkas terpisah.
- **Semua nilai warna/spacing/radius/durasi dari custom property di `:root`.** Dilarang menulis hex atau px mentah di tengah stylesheet.
- **Patokan layar 375×667** (iPhone SE). Anggaran tinggi konten ≈ 619px setelah padding aman.
- **Palet, persis:** `--paper: #F4EADA`, `--board: #6B4A2F`, `--espresso: #2E2016`, `--cocoa: #4A3524`, `--sepia: #7A5C3E`, `--rust: #8F4426`, `--tape: #D9C7A3`, `--sage: #8A9A78`, `--polaroid: #FFFFFF`.
- **`--tape` dan `--sage` tidak pernah menjadi warna teks maupun latar teks.**
- **Tiga famili font:** Lora 400/600, Caveat 600, Special Elite 400.
- **Kebijakan angka:** font angka mengikuti konteks kalimatnya. Tidak pernah berganti font di tengah kalimat.
- **Special Elite:** minimum 14px, hanya string pendek, tidak pernah untuk kalimat, warna minimum `--cocoa`.
- **Caveat:** minimum 18px, maksimum 3 baris per lembar, tanpa `uppercase`, tanpa `letter-spacing`.
- **Radius kertas ≤3px.** Polaroid radius 0.
- **Semua teks lolos WCAG AA** terhadap latar terburuk yang mungkin muncul di belakangnya.
- **Copy tampilan berbahasa Indonesia; nama class kebab-case bahasa Inggris.**
- **`prefers-reduced-motion` dihormati di setiap animasi baru.** Partikel canvas dilewati sepenuhnya, bukan dipercepat.
- **Foto tidak boleh di-commit** sampai repo dikembalikan privat dan hosting dipindah (spec §14). Task 6 memakai placeholder, bukan foto asli.

## Verification Harness

Proyek ini tidak punya test runner, dan menambahkannya melanggar aturan tanpa-dependency. Analog TDD di sini adalah **pengukuran di browser dengan nilai harapan yang eksplisit**: setiap task menulis pengecekan yang gagal dulu, lalu diimplementasikan sampai lolos.

Jalankan server sekali di awal, biarkan hidup selama seluruh pengerjaan:

```bash
python3 -m http.server 8000
```

Semua langkah verifikasi dijalankan terhadap `http://localhost:8000`. Snippet ditulis lengkap di tiap task — salin apa adanya, jangan dikarang ulang.

Fungsi kontras dipakai berulang di banyak task. Simpan sebagai satu blok yang di-paste ulang:

```js
function ratioOn(sel, bgHex) {
  function lum(c){
    const [r,g,b] = c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{
      v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    });
    return 0.2126*r + 0.7152*g + 0.0722*b;
  }
  const el = document.querySelector(sel);
  const cs = getComputedStyle(el);
  const op = parseFloat(cs.opacity);
  const fg = cs.color.match(/[\d.]+/g).slice(0,3).map(Number);
  const bg = bgHex.match(/\w\w/g).map(h => parseInt(h,16));
  const mix = fg.map((v,i)=> v*op + bg[i]*(1-op));
  const L1 = lum('rgb('+mix.join(',')+')'), L2 = lum('rgb('+bg.join(',')+')');
  const hi = Math.max(L1,L2), lo = Math.min(L1,L2);
  const px = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight,10) >= 700;
  const large = px >= 24 || (bold && px >= 18.66);
  const r = (hi+0.05)/(lo+0.05);
  return { sel, ratio: +r.toFixed(2), px: +px.toFixed(1), need: large?3:4.5, pass: r >= (large?3:4.5) };
}
```

**Catatan keterbatasan yang harus dilaporkan, bukan disembunyikan:** panel pratinjau melaporkan halaman sebagai `hidden`, sehingga `requestAnimationFrame` beku. Akibatnya animasi sampul terbuka, micro-feedback, dan deteksi tiupan **tidak dapat diverifikasi runtime** di lingkungan pengembangan. Task yang terdampak menyatakan ini eksplisit dan memverifikasi struktur serta CSS-nya saja.

## File Structure

| Berkas | Tanggung jawab | Status |
|---|---|---|
| `index.html` | Markup 7 layar: sampul + deck berisi 6 lembar | Tulis ulang |
| `style.css` | Token, tekstur kertas, sampul, deck, komponen lembar | Tulis ulang |
| `script.js` | Modul `AUDIO`, `MELODY`, `PARTICLES`, `CAKE`, `COVER`, `DECK` | Restrukturisasi |
| `assets/photos/` | Slot foto pengguna | Buat, isi placeholder |
| `DESIGN.md` | Sistem desain — §1–§6 ditulis ulang | Ubah |
| `CLAUDE.md` | Catatan proses & teknis | Ubah kecil |

Batas antarmodul di `script.js`:

- `AUDIO` — sintesis nada, analyser mikrofon, mute. Tidak bergantung pada apa pun.
- `MELODY` — penjadwalan Happy Birthday. Bergantung pada `AUDIO`.
- `PARTICLES` — sobekan kertas di canvas. Tidak bergantung pada apa pun.
- `CAKE` — lilin, deteksi tiupan, jalur cadangan. Bergantung pada `AUDIO`. Menerima satu callback `onDone`.
- `COVER` — animasi sampul terbuka. Bergantung pada `CAKE` (sebagai pemanggil). Menerima satu callback `onOpened`.
- `DECK` — scroll-snap, titik indikator, tombol panah. Tidak bergantung pada apa pun.

`CAKE` tidak tahu apa pun tentang `DECK`.

## Di luar cakupan rencana ini

**Pemindahan hosting ke Netlify privat (spec §14) bukan sebuah task.** Itu tindakan keluar yang butuh keputusan dan akun pengguna, jadi tidak boleh dijalankan otomatis di tengah implementasi. Rencana ini menegakkannya lewat dua cara: `.gitignore` memblokir berkas foto (Task 6 Step 3), dan laporan akhir mencantumkannya sebagai pemblokir rilis (Task 10 Step 6). Pemindahan dikerjakan sebagai langkah terpisah sesudah rencana ini selesai, dengan persetujuan eksplisit.

**Pengisian copy dan `alt`** juga di luar cakupan — isinya hanya diketahui pengguna. Rencana ini memastikan penandanya mencolok dan terhitung, bukan mengarangnya.

---

### Task 1: Fondasi token & tekstur kertas

**Files:**
- Modify: `style.css:1-60` (blok `:root` dan `body`)

**Interfaces:**
- Consumes: —
- Produces: seluruh custom property yang dipakai task berikutnya — `--paper`, `--board`, `--espresso`, `--cocoa`, `--sepia`, `--rust`, `--tape`, `--sage`, `--polaroid`, `--paper-grain`, `--font-body`, `--font-hand`, `--font-label`, `--sp-1`…`--sp-9`, `--r-paper`, `--r-cover`, `--r-photo`, `--r-pill`, `--sh-sheet`, `--sh-photo`, `--sh-lift`, `--dur-micro`, `--dur-base`, `--dur-cover`, `--ease-paper`, `--ease-lift`.

- [ ] **Step 1: Tulis pengecekan yang gagal dulu**

Buka `http://localhost:8000`, jalankan di konsol:

```js
(() => {
  const s = getComputedStyle(document.documentElement);
  const want = {'--paper':'#F4EADA','--board':'#6B4A2F','--espresso':'#2E2016',
    '--cocoa':'#4A3524','--sepia':'#7A5C3E','--rust':'#8F4426',
    '--tape':'#D9C7A3','--sage':'#8A9A78','--polaroid':'#FFFFFF'};
  return Object.entries(want).map(([k,v]) => ({token:k, got:s.getPropertyValue(k).trim(), ok:s.getPropertyValue(k).trim().toUpperCase()===v}));
})()
```

Expected sekarang: setiap `got` kosong, setiap `ok` false.

- [ ] **Step 2: Ganti blok `:root`**

Ganti seluruh blok `:root { … }` di `style.css` dengan:

```css
:root {
  /* Warna — spec §4 */
  --paper:    #F4EADA;
  --board:    #6B4A2F;
  --espresso: #2E2016;
  --cocoa:    #4A3524;
  --sepia:    #7A5C3E;
  --rust:     #8F4426;
  --tape:     #D9C7A3;
  --sage:     #8A9A78;
  --polaroid: #FFFFFF;

  /* Tipografi — spec §5 */
  --font-body:  'Lora', Georgia, serif;
  --font-hand:  'Caveat', cursive;
  --font-label: 'Special Elite', ui-monospace, monospace;

  --fs-display: clamp(3.5rem, 14vw, 4.5rem);  /* angka umur, Special Elite */
  --fs-h1:      clamp(1.75rem, 5.5vw, 2.25rem);
  --fs-h2:      clamp(1.375rem, 4vw, 1.625rem);
  --fs-body:    1rem;
  --fs-hand:    clamp(1.125rem, 4.5vw, 1.375rem);  /* min 18px — spec §5 */
  --fs-label:   0.875rem;                          /* 14px, plafon bawah Special Elite */

  /* Spacing — basis 4px */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px; --sp-9: 96px;

  /* Radius — kertas nyaris tanpa sudut membulat */
  --r-paper: 2px;
  --r-cover: 3px;
  --r-photo: 0;
  --r-pill:  999px;

  /* Bayangan bernada hangat */
  --sh-sheet: 0 6px 18px rgba(46, 32, 22, .18);
  --sh-photo: 0 3px 10px rgba(46, 32, 22, .26);
  --sh-lift:  0 12px 26px rgba(46, 32, 22, .24);

  /* Motion — spec §8. Easing memantul lama sengaja dibuang. */
  --dur-micro: 150ms;
  --dur-base:  300ms;
  --dur-cover: 800ms;
  --ease-paper: cubic-bezier(.22, .8, .3, 1);
  --ease-lift:  cubic-bezier(.34, 1.3, .64, 1);

  /* Tekstur kertas — ubin feTurbulence, dirasterisasi sekali, bukan filter hidup */
  --paper-grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E");
}
```

- [ ] **Step 3: Ganti blok `body` dan tautan font**

Di `index.html`, ganti tag `<link>` Google Fonts dengan:

```html
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Caveat:wght@600&family=Special+Elite&display=swap" rel="stylesheet">
```

Di `style.css`, ganti blok `body`:

```css
body {
  margin: 0;
  min-height: 100svh;
  font-family: var(--font-body);
  font-weight: 400;
  font-size: var(--fs-body);
  line-height: 1.6;
  color: var(--cocoa);
  background-color: var(--board);
  overflow-x: hidden;
}
```

- [ ] **Step 4: Jalankan ulang pengecekan Step 1**

Expected: sembilan baris, semua `ok: true`.

- [ ] **Step 5: Verifikasi font termuat**

```js
document.fonts.ready.then(() => ['Lora','Caveat','Special Elite']
  .map(f => ({font: f, loaded: document.fonts.check('16px "'+f+'"')})))
```

Expected: tiga baris, semua `loaded: true`.

- [ ] **Step 6: Commit**

```bash
git add style.css index.html
git commit -m "feat: token warna, tipografi, dan tekstur kertas tema scrapbook"
```

---

### Task 2: Sampul buku dengan kue

**Files:**
- Modify: `index.html` — ganti `section.slide-gate` dan `section.slide-cake` menjadi satu `section.cover`; hapus `div.backdrop`
- Modify: `style.css` — tambah `.cover-stage`, `.cover`; restyle `.cake`, `.candle`, `.sound-toggle`, `.btn*`; hapus `.backdrop`, `.blob`, `@keyframes drift`, `.stage`, `.slide`, `.card*`, `.gate*`

**Interfaces:**
- Consumes: seluruh token dari Task 1.
- Produces: elemen `#cover` (pembungkus sampul), `#candles` (wadah lilin, dipakai `CAKE`), `#cakeStatus`, `#privacyNote`, `#manualBtn`, `#micDebug`, `#startBtn`.

**Kenapa pembersihan ikut di task ini:** Task 1 menghapus token `--pink-*` dan `--lilac`. Setiap aturan yang masih menyebutnya jadi rusak diam-diam — `background: var(--pink-deep)` tanpa nilai jatuh ke transparan, bukan error. Tombol suara dan tombol biasa akan tak terlihat kalau dibiarkan. Jadi pembersihan bukan kerapian opsional, melainkan syarat supaya task ini menghasilkan halaman yang berfungsi.

- [ ] **Step 1: Tulis pengecekan yang gagal dulu**

```js
(() => {
  const c = document.getElementById('cover');
  if (!c) return {exists:false};
  const r = c.getBoundingClientRect();
  return { exists:true, h: Math.round(r.height), fitsSE: r.height <= 619,
           board: getComputedStyle(c).backgroundColor };
})()
```

Expected sekarang: `{exists: false}`.

- [ ] **Step 2: Ganti markup pembuka**

Di `index.html`, ganti kedua section (`.slide-gate` dan `.slide-cake`) dengan:

```html
<div class="cover-stage" id="coverStage">
  <section class="cover" id="cover">
    <p class="cover-kicker">Dari kakak lo</p>
    <h1 class="cover-name">Dinar</h1>

    <div class="cake" aria-hidden="true">
      <div class="candles" id="candles"></div>
      <div class="cake-top"></div>
      <div class="cake-bottom"></div>
      <div class="cake-plate"></div>
    </div>

    <p class="cover-status" id="cakeStatus" aria-live="polite">Siap-siap ya</p>
    <p class="cover-privacy" id="privacyNote">Suaranya diproses di HP lo doang, nggak dikirim ke mana-mana.</p>

    <button class="btn btn-ghost" id="startBtn" type="button">Mulai</button>
    <button class="btn btn-ghost" id="manualBtn" type="button" hidden>Tiup manual</button>
    <p class="mic-debug" id="micDebug" hidden></p>
  </section>
</div>
```

`#startBtn` tetap ada karena `AudioContext` dan izin mikrofon wajib lahir dari gestur pengguna.

- [ ] **Step 3: Tulis CSS sampul**

```css
.cover-stage {
  perspective: 1400px;
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: var(--sp-5);
}

.cover {
  width: 100%;
  max-width: 22rem;
  padding: var(--sp-7) var(--sp-5) var(--sp-6);
  border-radius: var(--r-cover);
  background-color: var(--board);
  background-image: var(--paper-grain);
  box-shadow: var(--sh-sheet);
  text-align: center;
  transform-origin: left center;
  transition: transform var(--dur-cover) var(--ease-paper),
              opacity var(--dur-cover) var(--ease-paper);
}

.cover.is-open { transform: rotateY(-105deg); opacity: 0; }

/* Teks di atas --board wajib --paper: 6,7:1 */
.cover-kicker {
  margin: 0 0 var(--sp-2);
  font-family: var(--font-label);
  font-size: var(--fs-label);
  letter-spacing: .06em;
  color: var(--paper);
}

.cover-name {
  margin: 0 0 var(--sp-6);
  font-family: var(--font-hand);
  font-weight: 600;
  font-size: var(--fs-h1);
  line-height: 1.2;
  color: var(--paper);
}

.cover-status {
  margin: var(--sp-5) 0 var(--sp-2);
  font-weight: 600;
  color: var(--paper);
}

.cover-privacy {
  margin: 0 0 var(--sp-5);
  font-size: var(--fs-label);
  color: var(--paper);
  opacity: .82;
}
```

- [ ] **Step 4: Restyle kue ke palet kraft**

Ganti nilai warna di blok kue yang sudah ada:

```css
.candle {
  position: relative;
  flex: 0 0 auto;
  width: 6px;
  height: 30px;
  border-radius: 3px;
  background: repeating-linear-gradient(45deg,
    var(--paper) 0 4px, var(--rust) 4px 8px);
}

.cake-top    { background: var(--tape); box-shadow: var(--sh-photo); }
.cake-top::after { background-image: radial-gradient(circle at 10px 0, var(--tape) 9px, transparent 9.5px); }
.cake-bottom { background: var(--paper); box-shadow: var(--sh-photo); }
.cake-plate  { background: var(--espresso); opacity: .34; }
```

Lebar api, tinggi lilin, dan `--cake-w` tidak diubah — nilai itu sudah terbukti muat satu baris.

- [ ] **Step 5: Buang markup dan CSS sisa tema pink**

Di `index.html`, hapus seluruh blok ini:

```html
<div class="backdrop" aria-hidden="true">
  <span class="blob blob-a"></span>
  <span class="blob blob-b"></span>
  <span class="blob blob-c"></span>
</div>
```

Di `style.css`, hapus seluruh aturan berikut: `.backdrop`, `.blob`, `.blob-a`, `.blob-b`, `.blob-c`, `@keyframes drift`, `.stage`, `.slide`, `body[data-slide=...]`, `@keyframes slide-in`, `.gate-name`, `.gate-kicker`, `.gate-hint`, `.lede`, `.card`, `.card-title`, `.card-line`, `.card-sign`, `.card-eyebrow`, `.script-line`, `.kicker`, `.cake-title`, `.cake-status`, `.privacy-note`, `.btn-start`, `.btn-manual`, `.replay`.

- [ ] **Step 6: Restyle chrome bersama ke palet kraft**

```css
.sound-toggle {
  position: fixed; top: var(--sp-4); right: var(--sp-4); z-index: 4;
  width: 44px; height: 44px;
  display: grid; place-items: center;
  border: 0; border-radius: var(--r-pill);
  background: var(--paper);
  box-shadow: var(--sh-photo);
  cursor: pointer;
  transition: transform var(--dur-micro) var(--ease-lift);
}

.sound-toggle:active { transform: scale(0.94); }

.sound-icon {
  width: 18px; height: 18px;
  background: var(--cocoa);
  clip-path: polygon(0 30%, 35% 30%, 70% 0, 70% 100%, 35% 70%, 0 70%);
  position: relative;
}

.sound-icon::after {
  content: ""; position: absolute; inset: 0;
  border-right: 3px solid var(--cocoa);
  border-radius: 0 var(--r-pill) var(--r-pill) 0;
  opacity: 0;
  transition: opacity var(--dur-micro) var(--ease-paper);
}

.sound-toggle[aria-pressed="false"] .sound-icon::after { opacity: 1; }
.sound-toggle[aria-pressed="true"]  .sound-icon { opacity: .38; }

.btn {
  min-height: 44px;
  padding: var(--sp-3) var(--sp-6);
  border: 0;
  border-radius: var(--r-paper);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--fs-body);
  cursor: pointer;
  transition: transform var(--dur-micro) var(--ease-lift);
}

.btn:active { transform: scale(0.97); }
.btn[disabled] { opacity: .5; cursor: default; transform: none; }

/* Teks --cocoa di atas --paper: 9,7:1 */
.btn-ghost { background: var(--paper); color: var(--cocoa); box-shadow: var(--sh-photo); }

.mic-debug {
  margin: var(--sp-5) auto 0;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--r-paper);
  background: var(--paper);
  color: var(--cocoa);
  font-family: var(--font-label);
  font-size: var(--fs-label);
  line-height: 1.5;
}

:focus-visible {
  outline: 3px solid var(--paper);
  outline-offset: 2px;
  border-radius: var(--r-paper);
}
```

Ring fokus memakai `--paper`, bukan `--espresso`: fokus dapat mendarat di atas `--board` (sampul) maupun `--paper` (lembar), dan `--paper` adalah satu-satunya nilai yang kontras di kedua latar tersebut.

- [ ] **Step 7: Verifikasi tidak ada token mati tersisa**

```bash
grep -nE '\-\-pink|\-\-lilac|\-\-cream|\-\-ink\b|\-\-white\b' style.css || echo "bersih"
```

Expected: `bersih`.

- [ ] **Step 8: Jalankan ulang pengecekan Step 1**

Expected: `exists: true`, `fitsSE: true`, `board: "rgb(107, 74, 47)"`.

- [ ] **Step 9: Verifikasi kontras teks sampul**

Paste `ratioOn` dari bagian Verification Harness, lalu:

```js
['.cover-kicker','.cover-name','.cover-status','.cover-privacy','.btn-ghost']
  .map(s => ratioOn(s, s === '.btn-ghost' ? 'F4EADA' : '6B4A2F'))
```

Expected: lima baris, semua `pass: true`. `.cover-privacy` pada opacity .82 harus tetap ≥4.5.

- [ ] **Step 10: Commit**

```bash
git add index.html style.css
git commit -m "feat: sampul buku kraft dengan kue di atasnya"
```

---

### Task 3: Deck geser horizontal

**Files:**
- Modify: `index.html` — tambah `div.deck` berisi enam `section.sheet`
- Modify: `style.css` — blok `.deck`, `.sheet`, `.dots`, `.arrow`
- Modify: `script.js` — tambah modul `DECK`

**Interfaces:**
- Consumes: token Task 1.
- Produces: `DECK.init()` — memasang observer dan tombol; `DECK.reveal()` — melepas `hidden` dari `#deck` lalu memindah fokus ke lembar pertama. Elemen `#deck`, `#dots`, `#prevBtn`, `#nextBtn`.

- [ ] **Step 1: Tulis pengecekan yang gagal dulu**

```js
(() => {
  const d = document.getElementById('deck');
  if (!d) return {exists:false};
  const sheets = d.querySelectorAll('.sheet');
  return { exists:true, sheets: sheets.length,
           snap: getComputedStyle(d).scrollSnapType,
           overflowY: getComputedStyle(d).overflowY,
           dots: document.querySelectorAll('#dots button').length };
})()
```

Expected sekarang: `{exists: false}`.

- [ ] **Step 2: Tambah markup deck**

Sesudah `</div>` penutup `.cover-stage` di `index.html`:

```html
<div class="deck" id="deck" hidden>
  <section class="sheet" aria-label="Lembar 1 dari 6" tabindex="-1"><div class="paper"></div></section>
  <section class="sheet" aria-label="Lembar 2 dari 6" tabindex="-1"><div class="paper"></div></section>
  <section class="sheet" aria-label="Lembar 3 dari 6" tabindex="-1"><div class="paper"></div></section>
  <section class="sheet" aria-label="Lembar 4 dari 6" tabindex="-1"><div class="paper"></div></section>
  <section class="sheet" aria-label="Lembar 5 dari 6" tabindex="-1"><div class="paper"></div></section>
  <section class="sheet" aria-label="Lembar 6 dari 6" tabindex="-1"><div class="paper"></div></section>
</div>

<nav class="deck-nav" id="deckNav" hidden>
  <button class="arrow" id="prevBtn" type="button" aria-label="Lembar sebelumnya">&#8249;</button>
  <div class="dots" id="dots"></div>
  <button class="arrow" id="nextBtn" type="button" aria-label="Lembar berikutnya">&#8250;</button>
</nav>
```

- [ ] **Step 3: Tulis CSS deck**

```css
.deck {
  display: flex;
  height: 100svh;
  overflow-x: auto;
  overflow-y: hidden;          /* lembar yang kelebihan tinggi jadi cacat terlihat */
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.deck::-webkit-scrollbar { display: none; }

.sheet {
  flex: 0 0 100%;
  scroll-snap-align: center;
  display: grid;
  place-items: center;
  padding: var(--sp-5);
}

.sheet:focus { outline: none; }

.paper {
  width: 100%;
  max-width: 21rem;
  padding: var(--sp-5) var(--sp-4);
  border-radius: var(--r-paper);
  background-color: var(--paper);
  background-image: var(--paper-grain);
  box-shadow: var(--sh-sheet);
  position: relative;
  text-align: center;
  transition: transform var(--dur-micro) var(--ease-lift),
              box-shadow var(--dur-micro) var(--ease-lift);
}

.sheet:active .paper { transform: translateY(-2px); box-shadow: var(--sh-lift); }

.deck-nav {
  position: fixed;
  left: 0; right: 0; bottom: var(--sp-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-4);
  z-index: 3;
}

.arrow {
  width: 44px; height: 44px;
  display: grid; place-items: center;
  border: 0; border-radius: var(--r-pill);
  background: var(--paper);
  color: var(--cocoa);
  font-size: 1.5rem; line-height: 1;
  box-shadow: var(--sh-photo);
  cursor: pointer;
}

.arrow[disabled] { opacity: .4; cursor: default; }

.dots { display: flex; gap: var(--sp-2); }

.dots button {
  width: 8px; height: 8px; padding: 0;
  border: 0; border-radius: var(--r-pill);
  background: var(--paper);
  opacity: .5;
  cursor: pointer;
}

.dots button[aria-current="true"] { background: var(--rust); opacity: 1; }
```

- [ ] **Step 4: Tulis modul `DECK`**

Tambah di `script.js` sebelum blok tombol:

```js
/* =======================================================
   DECK — geser horizontal berbasis scroll-snap native.
   Drag manual sengaja ditolak: momentum harus disimulasi,
   keyboard mati, dan di iOS bentrok sama gestur back.
   ======================================================= */

var DECK = (function () {
  var deck = document.getElementById('deck');
  var nav = document.getElementById('deckNav');
  var dotsWrap = document.getElementById('dots');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var sheets = [];
  var dots = [];
  var active = 0;

  function goTo(i) {
    if (i < 0 || i >= sheets.length) return;
    deck.scrollTo({ left: sheets[i].offsetLeft, behavior: 'smooth' });
  }

  function setActive(i) {
    active = i;
    for (var d = 0; d < dots.length; d++) {
      dots[d].setAttribute('aria-current', d === i ? 'true' : 'false');
    }
    prevBtn.disabled = (i === 0);
    nextBtn.disabled = (i === sheets.length - 1);
  }

  function init() {
    sheets = Array.prototype.slice.call(deck.querySelectorAll('.sheet'));

    for (var i = 0; i < sheets.length; i++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Ke lembar ' + (idx + 1));
        b.addEventListener('click', function () { goTo(idx); });
        dotsWrap.appendChild(b);
        dots.push(b);
      })(i);
    }

    // IntersectionObserver, bukan event scroll: tidak perlu debounce,
    // dan tidak ikut jalan tiap frame saat momentum masih berjalan.
    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].isIntersecting) setActive(sheets.indexOf(entries[e].target));
      }
    }, { root: deck, threshold: 0.6 });

    for (var s = 0; s < sheets.length; s++) io.observe(sheets[s]);

    prevBtn.addEventListener('click', function () { goTo(active - 1); });
    nextBtn.addEventListener('click', function () { goTo(active + 1); });

    setActive(0);
  }

  function reveal() {
    deck.hidden = false;
    nav.hidden = false;
    setActive(0);
    sheets[0].focus();
  }

  return { init: init, reveal: reveal, goTo: goTo };
})();
```

Panggil `DECK.init();` satu kali di akhir IIFE utama.

- [ ] **Step 5: Verifikasi struktur dan snap**

Buka konsol, lepas `hidden` secara manual untuk pengujian, lalu jalankan pengecekan Step 1:

```js
document.getElementById('deck').hidden = false;
document.getElementById('deckNav').hidden = false;
```

Expected: `sheets: 6`, `snap: "x mandatory"`, `overflowY: "hidden"`, `dots: 6`.

- [ ] **Step 6: Verifikasi posisi snap tiap lembar**

```js
(() => {
  const d = document.getElementById('deck');
  const s = [...d.querySelectorAll('.sheet')];
  return { widths: s.map(x => Math.round(x.getBoundingClientRect().width)),
           offsets: s.map(x => x.offsetLeft),
           deckWidth: Math.round(d.getBoundingClientRect().width) };
})()
```

Expected: seluruh `widths` sama dengan `deckWidth`; `offsets` naik dengan selisih tetap sebesar `deckWidth`.

- [ ] **Step 7: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: deck geser horizontal dengan scroll-snap dan titik indikator"
```

---

### Task 4: Serah terima sampul ke deck

**Files:**
- Modify: `script.js` — tambah modul `COVER`, sambungkan callback `CAKE`
- Modify: `style.css` — blok reduced-motion untuk sampul

**Interfaces:**
- Consumes: `DECK.reveal()` dari Task 3; `CAKE` yang sudah ada.
- Produces: `COVER.open()` — menjalankan animasi lalu memanggil `DECK.reveal()`.

- [ ] **Step 1: Tulis pengecekan yang gagal dulu**

```js
typeof COVER === 'undefined' ? {exists:false} : {exists:true, hasOpen: typeof COVER.open === 'function'}
```

Expected sekarang: `{exists: false}`.

- [ ] **Step 2: Tulis modul `COVER`**

```js
/* =======================================================
   COVER — sampul terbuka, lalu serahkan ke DECK.
   Rantai satu arah: CAKE -> COVER -> DECK. COVER tidak
   pernah memanggil balik ke CAKE.
   ======================================================= */

var COVER = (function () {
  var stage = document.getElementById('coverStage');
  var cover = document.getElementById('cover');
  var opened = false;

  function finish() {
    stage.hidden = true;     // buang lapisan komposit yang sudah tak terpakai
    DECK.reveal();

    // Perayaan pindah ke sini. Sebelumnya dipicu openCard(), yang
    // dihapus di Step 3 — tanpa dua baris ini lagu dan partikel
    // hilang tanpa suara.
    burstConfetti();         // diganti namanya jadi PARTICLES.burst() di Task 7
    playMelody();
    lockReplay(melodyDuration() * 1000);
  }

  function open() {
    if (opened) return;
    opened = true;

    cover.classList.add('is-open');

    // transitionend tetap menyala di mode reduced-motion karena
    // durasinya jadi 0.01ms, bukan nol.
    var done = false;
    cover.addEventListener('transitionend', function () {
      if (done) return;
      done = true;
      finish();
    }, { once: true });

    // Jaring pengaman: kalau transisi tidak pernah menyala
    // (tab tersembunyi, transisi dibatalkan), tetap lanjut.
    window.setTimeout(function () {
      if (done) return;
      done = true;
      finish();
    }, 1200);
  }

  return { open: open };
})();
```

- [ ] **Step 3: Sambungkan `CAKE` ke `COVER`**

Di modul `CAKE`, ganti isi `finish()` yang sekarang memanggil `openCard` menjadi:

```js
    function finish() {
      if (done) return;
      done = true;
      stopMic();
      setStatus('done');
      manualBtn.hidden = true;
      // Jeda supaya asap sempat naik, baru sampul dibuka
      window.setTimeout(COVER.open, reduceMotion.matches ? 200 : 900);
    }
```

Hapus fungsi `openCard` yang lama beserta pemanggilnya. `burstConfetti`, `playMelody`, `melodyDuration`, dan `lockReplay` **tidak** ikut dihapus — keempatnya sekarang dipanggil dari `COVER.finish()`.

- [ ] **Step 3b: Verifikasi tidak ada pemanggil yatim**

```bash
grep -nE 'openCard|slide-card|dataset\.slide|goTo\(' script.js
```

Expected: kosong. `goTo` yang lama milik pengalih slide; nama itu sekarang hanya hidup di dalam modul `DECK` sebagai fungsi privat, jadi kemunculan di luar `DECK` adalah sisa yang harus dihapus.

- [ ] **Step 4: Tambah aturan reduced-motion sampul**

```css
@media (prefers-reduced-motion: reduce) {
  .cover { transition: opacity 200ms linear; }
  .cover.is-open { transform: none; opacity: 0; }
  .sheet:active .paper { transform: none; }
}
```

Blok ini diletakkan **sesudah** blok reduced-motion global yang sudah ada, supaya menang urutan.

- [ ] **Step 5: Verifikasi rantai serah terima**

```js
(() => {
  document.getElementById('startBtn').click();
  COVER.open();
  return { coverOpenClass: document.getElementById('cover').classList.contains('is-open'),
           transform: getComputedStyle(document.getElementById('cover')).transform.slice(0,20),
           perspective: getComputedStyle(document.getElementById('coverStage')).perspective };
})()
```

Expected: `coverOpenClass: true`, `perspective: "1400px"`, `transform` bukan `"none"`.

- [ ] **Step 6: Verifikasi deck muncul sesudah jaring pengaman**

Jalankan di panggilan konsol terpisah, minimal 1,5 detik sesudah Step 5:

```js
({ stageHidden: document.getElementById('coverStage').hidden,
   deckHidden: document.getElementById('deck').hidden,
   focused: document.activeElement.getAttribute('aria-label') })
```

Expected: `stageHidden: true`, `deckHidden: false`, `focused: "Lembar 1 dari 6"`.

**Catat sebagai keterbatasan:** animasi rotasinya sendiri tidak terlihat karena rAF beku di panel pratinjau. Yang diverifikasi di sini adalah class, transform terhitung, dan rantai serah terima — bukan kemulusan geraknya.

- [ ] **Step 7: Commit**

```bash
git add script.js style.css
git commit -m "feat: animasi sampul terbuka dan serah terima ke deck"
```

---

### Task 5: Komponen isi lembar

**Files:**
- Modify: `index.html` — isi keenam `.paper`
- Modify: `style.css` — blok `.polaroid`, `.washi`, `.hand-cap`, `.stamp-date`, `.page-no`, `.letter`

**Interfaces:**
- Consumes: token Task 1, `.paper` dari Task 3.
- Produces: pola markup lembar yang dipakai Task 6 saat memasang foto.

- [ ] **Step 1: Tulis pengecekan yang gagal dulu**

```js
(() => {
  const p = document.querySelectorAll('.polaroid');
  return { polaroids: p.length, captions: document.querySelectorAll('.hand-cap').length,
           dates: document.querySelectorAll('.stamp-date').length,
           pageNos: document.querySelectorAll('.page-no').length };
})()
```

Expected sekarang: semua `0`.

- [ ] **Step 2: Isi lembar 1 sampai 5**

Pola untuk satu lembar berfoto tunggal — pakai untuk lembar 5:

```html
<div class="paper">
  <span class="washi washi-tl" aria-hidden="true"></span>
  <span class="washi washi-br" aria-hidden="true"></span>

  <figure class="polaroid">
    <img class="shot" src="assets/photos/07-placeholder.jpg" alt="" width="1200" height="900" loading="lazy" decoding="async">
    <figcaption class="stamp-date">2026 &middot; 08</figcaption>
  </figure>

  <p class="hand-cap">Dan sekarang lo di sini.</p>
  <span class="page-no">05</span>
</div>
```

Pola untuk lembar dua-foto — pakai untuk lembar 1 sampai 4:

```html
<div class="paper">
  <span class="washi washi-tl" aria-hidden="true"></span>
  <span class="washi washi-br" aria-hidden="true"></span>

  <div class="stack">
    <figure class="polaroid polaroid-a">
      <img class="shot" src="assets/photos/01-placeholder.jpg" alt="" width="1200" height="900" loading="lazy" decoding="async">
    </figure>
    <figure class="polaroid polaroid-b">
      <img class="shot" src="assets/photos/02-placeholder.jpg" alt="" width="1200" height="900" loading="lazy" decoding="async">
      <figcaption class="stamp-date">2010 &middot; 03</figcaption>
    </figure>
  </div>

  <p class="hand-cap">Lo yang ini, ga pernah mau diem.</p>
  <span class="page-no">01</span>
</div>
```

Nomor halaman `01`…`05` berurutan. `alt` sengaja dikosongkan di sini dan menjadi pekerjaan Task 6.

- [ ] **Step 3: Isi lembar 6 — penutup**

```html
<div class="paper letter">
  <span class="washi washi-tl" aria-hidden="true"></span>

  <p class="stamp-date">17 &middot; 08 &middot; 2026</p>
  <p class="age-display">16</p>

  <p class="letter-line">Gak kerasa udah 16. Rasanya baru kemarin lo <em>[GANTI: kebiasaan konyol dia waktu masih bocah]</em>.</p>
  <p class="letter-line"><em>[GANTI: satu hal spesifik yang lo diam-diam kagumin dari dia sekarang]</em></p>
  <p class="letter-line">Tahun ini semoga <em>[GANTI: satu hal konkret yang dia lagi kejar]</em>. Gw ada kalau lo butuh.</p>

  <p class="hand-cap sign">— Kakak lo</p>

  <button class="btn btn-ghost" id="replay" type="button">Puter lagunya lagi</button>
  <span class="page-no">06</span>
</div>
```

`#replay` dipertahankan dari versi sebelumnya. Spec tidak menyebutnya dihapus, dan menghilangkan fitur yang sudah ada tanpa keputusan eksplisit adalah regresi diam-diam. Penangan klik dan `lockReplay` yang sudah ada tetap dipakai apa adanya.

- [ ] **Step 4: Tulis CSS komponen**

```css
.washi {
  position: absolute;
  width: 62px; height: 20px;
  background: var(--tape);
  opacity: .9;
}

/* Dua sudut saja. Empat sudut bikin kaku, bukan scrapbook. */
.washi-tl { top: -8px; left: -12px; transform: rotate(-38deg); }
.washi-br { bottom: -8px; right: -12px; transform: rotate(-38deg); }

.polaroid {
  margin: 0;
  padding: var(--sp-2) var(--sp-2) var(--sp-4);
  background: var(--polaroid);
  border-radius: var(--r-photo);
  box-shadow: var(--sh-photo);
  transform: rotate(-1.5deg);
}

.shot {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: var(--tape);   /* terlihat sebagai bingkai kosong kalau foto gagal */
  border-radius: var(--r-photo);
}

.stack { position: relative; padding-bottom: var(--sp-5); }
.polaroid-a { transform: rotate(2deg) translateX(-6%); width: 62%; }
.polaroid-b { transform: rotate(-2.5deg) translateX(12%); width: 62%; margin-top: -18%; }

.hand-cap {
  margin: var(--sp-4) 0 0;
  font-family: var(--font-hand);
  font-weight: 600;
  font-size: var(--fs-hand);
  line-height: 1.4;
  color: var(--cocoa);
}

.stamp-date {
  margin: var(--sp-2) 0 0;
  font-family: var(--font-label);
  font-size: var(--fs-label);
  letter-spacing: .06em;
  font-variant-numeric: tabular-nums;
  color: var(--cocoa);
}

.page-no {
  position: absolute;
  right: var(--sp-3); bottom: var(--sp-2);
  font-family: var(--font-label);
  font-size: var(--fs-label);
  font-variant-numeric: tabular-nums;
  color: var(--rust);
}

/* Angka umur — Special Elite, karena terbaca sebagai angka distempel.
   Caveat pecah di ukuran ini; Lora terbaca netral seperti nomor buku teks. */
.age-display {
  margin: var(--sp-2) 0 var(--sp-5);
  font-family: var(--font-label);
  font-size: var(--fs-display);
  letter-spacing: .04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--espresso);
}

/* Angka di dalam kalimat ikut Lora — tidak pernah ganti font di tengah kalimat */
.letter-line {
  margin: 0 auto var(--sp-4);
  max-width: 34ch;
  font-variant-numeric: lining-nums;
  color: var(--cocoa);
}

.letter-line em {
  font-style: normal;
  padding: 0 var(--sp-1);
  border-radius: var(--r-paper);
  background: var(--tape);
  color: var(--espresso);
}

.hand-cap.sign { margin-top: var(--sp-5); color: var(--rust); }
```

- [ ] **Step 5: Jalankan ulang pengecekan Step 1**

Expected: `polaroids: 9`, `captions: 6`, `dates: 6`, `pageNos: 6`.

- [ ] **Step 6: Verifikasi tiap lembar muat 375×667**

Set viewport ke 375×667, lalu:

```js
[...document.querySelectorAll('.sheet .paper')].map((p, i) => {
  const h = p.getBoundingClientRect().height;
  return { sheet: i + 1, h: Math.round(h), fits: h <= 619 };
})
```

Expected: enam baris, semua `fits: true`. Lembar yang gagal harus dipotong isinya, bukan dinaikkan batasnya.

- [ ] **Step 7: Verifikasi kebijakan angka dan kontras**

```js
(() => {
  const fam = sel => getComputedStyle(document.querySelector(sel)).fontFamily.split(',')[0].replace(/"/g,'');
  const px  = sel => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
  return {
    ageDisplay:  { font: fam('.age-display'),  px: px('.age-display')  },
    stampDate:   { font: fam('.stamp-date'),   px: px('.stamp-date')   },
    pageNo:      { font: fam('.page-no'),      px: px('.page-no')      },
    letterLine:  { font: fam('.letter-line'),  px: px('.letter-line')  },
    handCap:     { font: fam('.hand-cap'),     px: px('.hand-cap')     },
    contrast: ['.hand-cap','.stamp-date','.page-no','.letter-line','.age-display']
      .map(s => ratioOn(s, 'F4EADA'))
  };
})()
```

Expected: `ageDisplay`, `stampDate`, `pageNo` semuanya `Special Elite` dengan `px >= 14`; `letterLine` `Lora`; `handCap` `Caveat` dengan `px >= 18`; seluruh baris `contrast` `pass: true`.

- [ ] **Step 8: Commit**

```bash
git add index.html style.css
git commit -m "feat: komponen lembar polaroid, washi tape, caption tangan, dan label mesin tik"
```

---

### Task 6: Slot foto

**Files:**
- Create: `assets/photos/README.md`
- Create: `assets/photos/.gitkeep`
- Modify: `index.html` — isi seluruh atribut `alt`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: markup `.shot` dari Task 5.
- Produces: kontrak penamaan berkas `NN-<slug>.jpg` dan daftar `alt` yang harus diisi pengguna.

- [ ] **Step 1: Tulis pengecekan yang gagal dulu**

```js
[...document.querySelectorAll('.shot')].map((img, i) => ({
  i: i + 1, src: img.getAttribute('src').split('/').pop(),
  altEmpty: img.getAttribute('alt') === '',
  lazy: img.loading === 'lazy',
  hasRatio: getComputedStyle(img).aspectRatio !== 'auto'
}))
```

Expected sekarang: sembilan baris dengan `altEmpty: true`.

- [ ] **Step 2: Buat kontrak folder foto**

`assets/photos/README.md`:

```markdown
# Foto scrapbook

Penamaan: `NN-<slug>.jpg`, `NN` mengikuti urutan kemunculan di halaman.

| Berkas | Lembar | Babak |
|---|---|---|
| `01-*.jpg`, `02-*.jpg` | 1 | Dulu |
| `03-*.jpg`, `04-*.jpg` | 2 | Dulu |
| `05-*.jpg`, `06-*.jpg` | 3 | Sekarang |
| `07-*.jpg` | 4 | Sekarang |
| `08-*.jpg` | 5 | Harapan |

Syarat tiap berkas:
- JPEG, lebar maksimum 1200px
- Target ≤200KB. Total seluruh foto ≤2MB.
- Rasio bebas; dipangkas ke 4:3 lewat `object-fit: cover`.

JANGAN commit foto ke repo publik. Lihat spec §14 — repo harus
dikembalikan privat dan hosting dipindah lebih dulu.
```

`assets/photos/.gitkeep` dibuat kosong.

- [ ] **Step 3: Blokir foto asli dari commit sampai hosting pindah**

Tambah di `.gitignore`:

```gitignore
.DS_Store

# Foto dilarang masuk repo publik — spec §14.
# Hapus dua baris ini SESUDAH repo privat dan hosting pindah ke Netlify.
assets/photos/*.jpg
assets/photos/*.jpeg
```

- [ ] **Step 4: Isi seluruh `alt` dengan penanda wajib-ganti**

Ganti tiap `alt=""` menjadi teks yang tidak bisa lolos tanpa disadari:

```html
alt="[GANTI-ALT: jelaskan isi foto ini]"
```

`alt` deskriptif tidak dapat dikarang saat implementasi — isi foto belum diketahui. Penanda ini masuk ke checklist rilis.

- [ ] **Step 5: Verifikasi perilaku foto hilang**

Tanpa berkas foto apa pun di `assets/photos/`, muat halaman lalu:

```js
(() => {
  const imgs = [...document.querySelectorAll('.shot')];
  return { broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length,
           papersIntact: document.querySelectorAll('.paper').length,
           anyOverflow: [...document.querySelectorAll('.sheet .paper')]
             .some(p => p.getBoundingClientRect().height > 619) };
})()
```

Expected: `broken: 9`, `papersIntact: 6`, `anyOverflow: false`. Foto hilang harus menyisakan bingkai polaroid kosong berlatar `--tape`, bukan merusak tata letak.

- [ ] **Step 6: Commit**

```bash
git add assets/photos/README.md assets/photos/.gitkeep .gitignore index.html
git commit -m "feat: kontrak slot foto dengan alt wajib isi dan pemblokir commit foto"
```

---

### Task 7: Kalimba dan partikel sobekan kertas

**Files:**
- Modify: `script.js` — `AUDIO.CURRENT`, modul `PARTICLES`

**Interfaces:**
- Consumes: `AUDIO` yang sudah ada.
- Produces: `PARTICLES.burst()` menggantikan `burstConfetti()`.

- [ ] **Step 1: Tulis pengecekan yang gagal dulu**

```js
(() => {
  const src = document.querySelector('script[src="script.js"]');
  return fetch(src.src).then(r => r.text()).then(t => ({
    kalimbaDefault: /var CURRENT = 'kalimba'/.test(t),
    hasParticles: /var PARTICLES = /.test(t),
    noBrightConfetti: !/#FF4D8D/.test(t)
  }));
})()
```

Expected sekarang: ketiganya `false`.

- [ ] **Step 2: Ganti instrumen default**

```js
    var CURRENT = 'kalimba';
```

Komentar di atasnya diganti menjadi:

```js
    // Kalimba: timbre kayu, menyatu dengan kraft.
    // Ganti ke 'musicbox' kalau ingin lebih berdenting.
```

- [ ] **Step 3: Ubah `burstConfetti` menjadi `PARTICLES`**

Ganti nama fungsi dan blok warna/bentuk. Mesin partikel, anggaran, dan pembersihannya **tidak diubah**:

```js
/* =======================================================
   PARTICLES — sobekan kertas. Mesin, anggaran, dan
   pembersihan sama persis dengan versi confetti.
   ======================================================= */

var PARTICLES = (function () {
  var COLORS = ['#F4EADA', '#D9C7A3', '#6B4A2F', '#8F4426', '#8A9A78'];

  function burst() {
    if (reduceMotion.matches) return;
    // Badan fungsi = salinan persis `burstConfetti` yang ada sekarang
    // di script.js, dengan tepat tiga perubahan yang dirinci di bawah.
  }

  return { burst: burst };
})();
```

Tiga perubahan itu, tidak lebih:

1. Rujukan `CONFETTI_COLORS` diganti `COLORS`; konstanta `CONFETTI_COLORS` lama dihapus.
2. Objek partikel: properti `size` dan `round` diganti `w` dan `h` (kode di Step 3b).
3. Blok gambar: cabang `if (p.round) { … arc … }` dibuang seluruhnya, sisakan `fillRect` (kode di Step 3c).

Sisanya — `dpr` di-cap 2, `count` 80/150, `LIFE` 3000, gravitasi 1400, `fade` 800ms terakhir, `cancelAnimationFrame` + `canvas.remove()` — disalin tanpa diubah. Anggaran itu sudah terbukti dan bukan bagian dari perubahan tema.

- [ ] **Step 3c: Blok gambar partikel**

```js
        ctx2d.save();
        ctx2d.globalAlpha = fade;
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.rot);
        ctx2d.fillStyle = p.color;
        // Sobekan kertas: persegi panjang tak beraturan, tanpa lingkaran
        ctx2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx2d.restore();
```

- [ ] **Step 3b: Pembuatan partikel**

```js
      parts.push({
        x: w / 2, y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 200,
        w: 6 + Math.random() * 9,
        h: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 4,   // lebih lambat dari confetti: kertas berat
        color: COLORS[(Math.random() * COLORS.length) | 0]
      });
```

Ganti seluruh pemanggil `burstConfetti()` menjadi `PARTICLES.burst()`.

- [ ] **Step 4: Jalankan ulang pengecekan Step 1**

Expected: ketiganya `true`.

- [ ] **Step 5: Verifikasi anggaran partikel tidak berubah**

```js
fetch('script.js').then(r=>r.text()).then(t => ({
  budget: /w < 768 \? 80 : 150/.test(t),
  life: /LIFE = 3000/.test(t),
  cleanup: /cancelAnimationFrame/.test(t) && /canvas\.remove\(\)/.test(t),
  dprCap: /Math\.min\(window\.devicePixelRatio \|\| 1, 2\)/.test(t)
}))
```

Expected: keempatnya `true`.

- [ ] **Step 6: Commit**

```bash
git add script.js
git commit -m "feat: instrumen kalimba dan partikel sobekan kertas"
```

---

### Task 8: Regresi jalur mikrofon sesudah restrukturisasi

**Files:**
- Modify: `script.js` hanya jika ada regresi

**Interfaces:**
- Consumes: `CAKE` dan `AUDIO` yang sudah ada.
- Produces: tidak ada API baru. Task ini membuktikan tidak ada yang rusak.

Restrukturisasi Task 2 memindahkan elemen kue dari `.slide-cake` ke `.cover`. `CAKE` mencari elemen lewat id, jadi seharusnya tetap jalan — tapi "seharusnya" bukan bukti.

- [ ] **Step 1: Verifikasi jalur izin ditolak**

Panel pratinjau memblokir mikrofon, jadi jalur ini terpicu sendiri:

```js
(() => {
  document.getElementById('startBtn').click();
  return new Promise(r => setTimeout(() => r({
    status: document.getElementById('cakeStatus').textContent,
    manualVisible: !document.getElementById('manualBtn').hidden,
    privacyHidden: document.getElementById('privacyNote').hidden,
    candles: document.querySelectorAll('.candle').length
  }), 400));
})()
```

Expected: `status: "Nggak apa-apa — pakai tombol aja"`, `manualVisible: true`, `privacyHidden: true`, `candles: 16`.

- [ ] **Step 2: Verifikasi jalur API tidak ada**

Muat ulang halaman, lalu:

```js
(() => {
  const real = navigator.mediaDevices;
  Object.defineProperty(navigator, 'mediaDevices', {configurable:true, get:()=>undefined});
  document.getElementById('startBtn').click();
  return new Promise(r => setTimeout(() => {
    const out = { status: document.getElementById('cakeStatus').textContent,
                  manualVisible: !document.getElementById('manualBtn').hidden };
    Object.defineProperty(navigator, 'mediaDevices', {configurable:true, get:()=>real});
    r(out);
  }, 300));
})()
```

Expected: `status: "Browser ini nggak bisa akses mikrofon"`, `manualVisible: true`.

- [ ] **Step 3: Verifikasi rantai lengkap jalur manual**

Muat ulang, klik `#startBtn`, klik `#manualBtn`, tunggu, lalu di panggilan konsol terpisah:

```js
({ out: document.querySelectorAll('.candle.is-out').length,
   stageHidden: document.getElementById('coverStage').hidden,
   deckHidden: document.getElementById('deck').hidden })
```

Expected: `out: 16`, `stageHidden: true`, `deckHidden: false`.

- [ ] **Step 4: Verifikasi `AudioContext` masih lahir dari gestur**

Muat ulang, lalu sebelum menyentuh apa pun:

```js
(() => {
  const Real = window.AudioContext; let made = 0;
  window.AudioContext = function(){ made++; return new Real(); };
  const before = made;
  document.getElementById('startBtn').click();
  return { beforeGesture: before, afterGesture: made };
})()
```

Expected: `beforeGesture: 0`, `afterGesture: 1`.

- [ ] **Step 5: Verifikasi halaman tetap selesai tanpa Web Audio**

Spec §12 mensyaratkan halaman tetap dapat diselesaikan bila `AudioContext` tidak tersedia. Muat ulang, lalu:

```js
(() => {
  window.AudioContext = undefined; window.webkitAudioContext = undefined;
  const errs = []; window.addEventListener('error', e => errs.push(e.message));
  document.getElementById('startBtn').click();
  return new Promise(r => setTimeout(() => r({
    errors: errs,
    manualVisible: !document.getElementById('manualBtn').hidden,
    candles: document.querySelectorAll('.candle').length
  }), 400));
})()
```

Expected: `errors: []`, `manualVisible: true`, `candles: 16`. Lalu klik `#manualBtn` dan pastikan deck tetap terbuka — tanpa suara, tanpa error.

- [ ] **Step 6: Perbaiki regresi bila ada, lalu commit**

Kalau seluruh langkah lolos tanpa perubahan kode, commit tetap dilakukan agar riwayat mencatat verifikasinya:

```bash
git commit --allow-empty -m "test: verifikasi jalur mikrofon utuh sesudah restrukturisasi sampul"
```

---

### Task 9: Selaraskan DESIGN.md dan CLAUDE.md

**Files:**
- Modify: `DESIGN.md` — §1 sampai §6 dan checklist §9
- Modify: `CLAUDE.md` — bagian "Tentang project" dan "Yang TIDAK boleh"

**Interfaces:**
- Consumes: seluruh keputusan Task 1 sampai 7.
- Produces: dokumen yang cocok dengan kode. Dokumen yang berbohong lebih buruk daripada tidak ada dokumen.

- [ ] **Step 1: Cari klaim yang sudah basi**

```bash
grep -nE 'pink|playful|Baloo|Poppins|Dancing|musicbox|music box|#FF4D8D|#FFD6E5|#A81A4C|bouncy' DESIGN.md CLAUDE.md
```

Setiap baris yang muncul adalah klaim yang tidak lagi benar dan harus diganti.

- [ ] **Step 2: Tulis ulang DESIGN.md §1 sampai §6**

Ganti tabel prinsip §1 dari "playful vs alay" menjadi "buatan tangan vs berantakan":

| Berantakan (HINDARI) | Buatan tangan (PAKAI) |
|---|---|
| Semua elemen dimiringkan acak | Kemiringan kecil dan terkontrol, ≤2,5°, tiap lembar beda |
| Washi tape di empat sudut tiap foto | Dua sudut, dan tidak selalu sudut yang sama |
| Tekstur kertas pekat sampai teks susah dibaca | Tekstur di opasitas 0,05 — terasa, tidak mengganggu |
| Font tulisan tangan dipakai untuk kalimat panjang | Tulisan tangan hanya untuk 1–3 baris perasaan |
| Angka ganti font tiap muncul | Angka mengikuti konteks kalimatnya |
| Bayangan tebal abu-abu | Bayangan tipis bernada coklat |

Ganti §2 palet dengan tabel dari spec §4, termasuk kolom rasio kontras. Ganti §3 tipografi dengan spec §5 lengkap dengan tabel kebijakan angka. Ganti §4 spacing/radius dengan spec §6. Ganti §5 motion dengan spec §8. Tambahkan aturan deck ke §6.

- [ ] **Step 3: Perbarui checklist DESIGN.md**

Tambah butir yang bisa diukur, bukan dikira-kira:

```markdown
- [ ] Setiap lembar terukur ≤619px tinggi di viewport 375×667
- [ ] Special Elite tidak pernah di bawah 14px dan tidak pernah untuk kalimat
- [ ] Caveat tidak pernah di bawah 18px, maksimum 3 baris per lembar
- [ ] Tidak ada pergantian font angka di tengah kalimat
- [ ] Radius seluruh permukaan kertas ≤3px
- [ ] Titik indikator sinkron dengan lembar yang sedang tampil
- [ ] Setiap foto punya alt yang ditulis manusia, bukan penanda [GANTI-ALT]
```

- [ ] **Step 4: Perbarui CLAUDE.md**

Ganti deskripsi tema:

```markdown
Website sederhana (HTML/CSS/JS vanilla, tanpa framework/build tool) — scrapbook
ulang tahun: sampul berisi kue yang ditiup, lalu lima lembar foto yang digeser
horizontal, ditutup surat.
```

Ganti butir larangan yang menyebut pink:

```markdown
- Ganti atau nambah warna di luar palet di §2 DESIGN.md
- Nambah signature interaction kedua — tiup lilin adalah satu-satunya
- Ganti scroll-snap jadi drag berbasis pointer (alasan penolakannya ada di §7 spec)
```

- [ ] **Step 5: Verifikasi tidak ada klaim basi tersisa**

```bash
grep -nE 'pink|playful|Baloo|Poppins|Dancing|#FF4D8D|#FFD6E5|#A81A4C' DESIGN.md CLAUDE.md || echo "bersih"
```

Expected: `bersih`.

- [ ] **Step 6: Commit**

```bash
git add DESIGN.md CLAUDE.md
git commit -m "docs: selaraskan sistem desain dengan tema scrapbook"
```

---

### Task 10: Sapuan verifikasi akhir

**Files:**
- Tidak ada perubahan kode kecuali sapuan ini menemukan cacat.

- [ ] **Step 1: Sapu kontras seluruh teks terhadap latar terburuk**

```js
(() => {
  const onPaper = ['.hand-cap','.stamp-date','.page-no','.letter-line','.age-display'];
  const onBoard = ['.cover-kicker','.cover-name','.cover-status','.cover-privacy'];
  return { paper: onPaper.map(s => ratioOn(s, 'F4EADA')),
           board: onBoard.map(s => ratioOn(s, '6B4A2F')) };
})()
```

Expected: seluruh baris `pass: true`.

- [ ] **Step 2: Sapu ukuran di 375×667 dan 320×568**

Untuk masing-masing viewport:

```js
({ horizScroll: document.documentElement.scrollWidth > window.innerWidth,
   tallSheets: [...document.querySelectorAll('.sheet .paper')]
     .map((p,i)=>({sheet:i+1, h:Math.round(p.getBoundingClientRect().height)}))
     .filter(x => x.h > window.innerHeight - 48) })
```

Expected: `horizScroll: false`, `tallSheets: []`.

- [ ] **Step 3: Sapu keyboard dan fokus**

Tekan Tab berulang dari halaman baru dimuat, lalu:

```js
[...document.querySelectorAll('button, [tabindex]:not([tabindex="-1"])')]
  .map(e => e.id || e.className)
```

Expected: urutan `soundToggle`, `startBtn`, lalu tombol deck. Setiap elemen yang difokuskan lewat Tab harus menampilkan ring 3px.

- [ ] **Step 4: Sapu berat halaman**

```js
performance.getEntriesByType('resource')
  .reduce((s,r)=> s + (r.transferSize||0), 0)
```

Expected: di bawah 2.000.000 byte tanpa foto asli; catat angkanya untuk dibandingkan sesudah foto masuk.

- [ ] **Step 5: Sapu penanda yang belum diisi**

```bash
grep -c 'GANTI' index.html
```

Expected: 12 — tiga slot surat plus sembilan `alt`. Angka ini masuk laporan akhir sebagai pekerjaan pengguna yang tersisa, bukan disembunyikan.

- [ ] **Step 6: Tulis laporan keterbatasan**

Laporan akhir wajib menyebut apa adanya, tanpa dihaluskan:

- Animasi sampul terbuka dan micro-feedback lembar: **tidak diverifikasi runtime** (rAF beku di panel pratinjau).
- `prefers-reduced-motion`: **tidak diverifikasi runtime** (media query tidak dapat diemulasi).
- Deteksi tiupan mikrofon: **tidak pernah dijalankan dengan mikrofon sungguhan**; ambang `LOW_MARGIN`, `LOW_MIN`, `RATIO_MIN` masih tebakan terdidik dan harus disetel lewat `?debug=1` di perangkat.
- Foto: masih placeholder; `alt` masih penanda.
- Hosting: masih GitHub Pages publik. Pemindahan ke Netlify privat wajib dilakukan sebelum foto pertama di-commit.

- [ ] **Step 7: Commit**

```bash
git commit --allow-empty -m "test: sapuan verifikasi akhir redesign scrapbook"
```
