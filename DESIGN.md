# DESIGN.md

Design system reference untuk project ini. **Ini satu-satunya sumber kebenaran soal visual** — warna, font, spacing, motion, copy. CLAUDE.md ngatur proses, file ini ngatur rasa.

Baca sebelum nulis/ubah CSS atau markup apapun.

---

## 1. Prinsip Utama

Playful **bukan berarti alay**. Beda tipis tapi krusial:

| Alay (HINDARI) | Playful yang benar (PAKAI) |
|---|---|
| Emoji ditumpuk berlebihan di tiap baris teks | Emoji dipakai sesekali, sebagai aksen bukan pengganti kata |
| Font comic/cursive norak (Comic Sans dkk) | Font rounded modern (Baloo 2, Fredoka) — playful tapi tetap desainer punya |
| Warna pelangi semua dipakai sekaligus | Palet terbatas, 1 warna dominan + 1-2 aksen |
| Animasi nyala-nyala di semua elemen bersamaan | Satu momen animasi yang jadi "signature", sisanya tenang |
| Copy lebay/bombastis ("SUPER DUPER AMAZING!!!") | Copy jujur, hangat, secukupnya |
| Border-radius ekstrem + shadow tebal di semua card | Radius & shadow konsisten, dipakai dengan hierarki |

Aturan induk: **spend boldness di satu tempat**. Kalau warna udah berani, animasi tenang. Kalau animasi jadi signature, layout & tipografi di sekitarnya harus disiplin.

**Signature interaction: tepat 1 per halaman.** Bukan per section, bukan per slide. Satu halaman = satu momen yang orang inget.

Halaman ini punya beberapa slide, dan tetap **cuma satu signature: tiup lilin**. Slide lain boleh punya interaksi, tapi harus jelas lebih kecil — tap biasa, tombol, transisi. Kalau ada dua interaksi yang sama-sama minta perhatian, dua-duanya jadi lemah. Sisanya cukup micro-feedback (hover, press, fade-in) — itu bukan signature, itu sopan santun.

---

## 2. Palet Warna — Pink-dominant

```css
:root {
  --pink-primary: #FF4D8D;  /* hero color. Fill besar, background section, dekorasi. */
  --pink-soft:    #FFD6E5;  /* background section lembut, surface card */
  --pink-deep:    #A81A4C;  /* SEMUA teks/ikon warna pink. Juga bg tombol kecil. */
  --lilac:        #A78BFA;  /* satu-satunya warna dingin yang boleh. Dekoratif doang. */
  --accent-gold:  #FFC94D;  /* aksen sekunder, dipakai SEDIKIT — badge, garis, highlight */
  --ink:          #2B1830;  /* teks utama + focus ring. Bukan hitam pekat. */
  --cream:        #FFF8F4;  /* background netral kalau butuh napas dari pink */
  --white:        #FFFFFF;
}
```

### Aturan kontras (WAJIB — ini bukan saran)

Semua teks harus lolos WCAG AA. Pasangan yang udah diverifikasi:

| Teks | di atas | Rasio | Boleh dipakai buat |
|---|---|---|---|
| `--ink` | `--cream` / `--white` | 15.6:1 | semua ukuran |
| `--ink` | `--pink-soft` | 12.3:1 | semua ukuran |
| `--pink-deep` | `--cream` / `--white` | 6.9:1 | semua ukuran |
| `--pink-deep` | `--pink-soft` | 5.5:1 | semua ukuran |
| `--white` | `--pink-deep` | 7.2:1 | semua ukuran — **ini tombol default** |
| `--white` | `--pink-primary` | **3.1:1** | ⚠️ HANYA teks besar: ≥24px, atau ≥19px bold |
| `--pink-primary` | `--cream` | **3.0:1** | ⚠️ JANGAN buat teks. Fill/dekorasi doang. |

Konsekuensi praktis:

- **`--pink-primary` bukan warna teks.** Titik. Dia warna isi: background section, blob dekoratif, ilustrasi, garis tebal.
- **Tombol pakai `--pink-deep` sebagai background + teks putih.** Kalau mau tombol `--pink-primary`, teksnya wajib ≥19px bold — dan itu cuma buat CTA hero, bukan tombol biasa.
- Headline gede di atas `--pink-primary` boleh putih (ukurannya lolos).
- Teks di atas `--pink-soft` pakai `--pink-deep` atau `--ink`.

### Aturan pakai warna

- Pink adalah **hero color**, bukan aksen — boleh jadi background section penuh.
- Gold cuma detail kecil (badge, garis, highlight). Dipakai luas → keliatan "pelangi ultah anak SD". Boleh jadi background highlight teks **asal teksnya `--ink`** (10.8:1). **Teks putih di atas gold dilarang** — 1.6:1, ga kebaca.
- `--lilac` dekoratif murni: bentuk background, partikel, glow. Bukan teks, bukan tombol.
- Butuh warna di luar daftar ini? Minta izin dulu. Jangan improvisasi.

### Dark mode

**Tidak ada dark mode di project ini.** Jangan bikin `@media (prefers-color-scheme: dark)`. Halaman ini satu look, terang, pink. Selesai.

---

## 3. Tipografi

**Dua family kerja + satu aksen. Ga boleh lebih.**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&family=Dancing+Script:wght@600&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
```

- **Display/heading — Baloo 2, weight 700.** Cuma buat headline & angka besar. Jangan buat body text panjang.
- **Body — Poppins, weight 400 (600 buat penegasan).** Ini yang bikin desain ga keliatan alay — body harus clean dan gampang dibaca.
- **Aksen — Dancing Script, weight 600.** Font sambung. Aturan pakainya di bawah, dan ketat.
- Load cuma weight yang kepake. Jangan tarik `wght@100..900` — itu bikin file font membengkak tanpa alasan.
- `display=swap` wajib, biar teks ga ilang pas font loading.

### Aturan font sambung (Dancing Script)

Font sambung itu bumbu, bukan bahan utama. Dipakai kebanyakan → langsung jatuh ke kategori alay di §1.

- **Maks 2 baris per halaman.** Bukan per slide — per halaman. Sekarang jatahnya: 1 di slide kue, 1 di kartu. Jatahnya habis.
- **Minimal 24px.** Di bawah itu sambungan hurufnya jadi bubur di layar HP.
- **Jangan `text-transform: uppercase`.** Huruf kapital mutusin sambungan — itu ngerusak satu-satunya alasan font ini dipakai.
- **Jangan `letter-spacing`.** Alasannya sama: itu misahin huruf yang harusnya nyambung.
- **Maks ~8 kata per baris.** Lebih dari itu capek dibaca.
- **Cuma di atas `--white` atau `--cream`, warna `--ink` atau `--pink-deep`.** Stroke-nya tipis — di atas pink jadi susah kebaca walaupun rasio angkanya lolos.
- `line-height` minimal `1.4` — huruf sambung punya ekor atas-bawah yang gampang tabrakan.
- **Jangan buat teks fungsional.** Tombol, label, nav, instruksi — semua pakai Poppins. Font sambung cuma buat kalimat yang sifatnya perasaan.

### Skala tipografi

Fluid pakai `clamp()`, mobile-first. Baseline 375px → desktop 1440px.

```css
--fs-hero:  clamp(2.5rem, 8vw, 4rem);      /* 40 → 64px */
--fs-h1:    clamp(2rem, 6vw, 2.75rem);     /* 32 → 44px */
--fs-h2:    clamp(1.5rem, 4vw, 2rem);      /* 24 → 32px */
--fs-lead:  clamp(1.125rem, 2.5vw, 1.25rem); /* 18 → 20px */
--fs-body:  1rem;                           /* 16px — jangan lebih kecil buat body */
--fs-small: 0.875rem;                       /* 14px — caption/label doang */
```

Line-height: heading `1.15`, body `1.6`. Body text max-width `60ch` — kalimat kepanjangan susah dibaca.

---

## 4. Spacing & Radius

Base 4px. Cuma pakai angka dari skala ini — jangan `margin: 27px`.

```css
--sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;
--sp-5: 24px;  --sp-6: 32px;  --sp-7: 48px;  --sp-8: 64px;  --sp-9: 96px;
```

Padding section: `var(--sp-8)` di mobile, `var(--sp-9)` di desktop.

```css
--r-sm:   8px;    /* badge, input, tombol kecil */
--r-md:   16px;   /* tombol besar */
--r-lg:   24px;   /* card */
--r-full: 999px;  /* pill / avatar — dipakai sengaja, bukan asal */
```

Jangan campur radius kotak dan bulat penuh secara acak dalam satu kelompok elemen.

### Shadow

Soft, warna-tinted (bukan abu-abu generik) biar nyatu sama tema:

```css
--shadow-sm: 0 2px 8px rgba(168, 26, 76, 0.08);
--shadow-md: 0 8px 20px rgba(255, 77, 141, 0.15);
--shadow-lg: 0 12px 30px rgba(255, 77, 141, 0.18);
```

Jangan `rgba(0,0,0,0.5)` — berat dan bikin kotor.

---

## 5. Motion

### Durasi

```css
--dur-micro:  150ms;  /* hover, press, toggle kecil */
--dur-base:   300ms;  /* transisi elemen, fade-in, slide */
--dur-signature: 800ms; /* momen utama halaman */
```

Kalau ada animasi lebih dari 1 detik yang bukan signature — itu kelamaan, potong.

### Easing

```css
--ease-bounce: cubic-bezier(.34, 1.56, .64, 1);  /* interaksi utama: klik, drag, reveal */
--ease-soft:   cubic-bezier(.25, .8, .35, 1);     /* ambient, background, loop kecil */
```

Jangan bouncy semua — kalau semua elemen mantul-mantul jadi norak. Bouncy itu buat momen yang user picu sendiri.

### Reduced motion — wajib di setiap animasi baru

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Blok global ini bukan pengganti berpikir: efek canvas (confetti) **di-skip total**, bukan cuma dipercepat — cek `matchMedia('(prefers-reduced-motion: reduce)').matches` di JS sebelum jalanin.

### Budget efek canvas (confetti dkk)

Library dilarang, jadi efek dibikin manual. Ceiling biar HP ga ngos-ngosan:

- Partikel maks: **150 desktop, 80 mobile** (`window.innerWidth < 768`).
- Durasi maks **3 detik**, terus `cancelAnimationFrame` + `canvas.remove()`. Jangan biarin loop jalan selamanya.
- Canvas pakai `position: fixed` + `pointer-events: none`, jangan halangin klik.
- Skala `devicePixelRatio` biar ga blur, tapi cap di 2 — di atas itu buang-buang GPU.
- Reduced motion → jangan render sama sekali.

---

## 6. Interaksi & Aksesibilitas

- **Touch wajib jalan.** Interaksi utama (klik, drag, hold) pakai Pointer Events (`pointerdown`/`pointermove`/`pointerup`), bukan mouse-only. Kalau drag, set `touch-action: none` di elemennya.
- **Target sentuh minimal 44×44px.** Tombol kecil di mobile = frustrasi.
- **Focus ring wajib kelihatan** di semua elemen interaktif. Jangan `outline: none` tanpa pengganti.
  ```css
  :focus-visible {
    outline: 3px solid var(--ink);
    outline-offset: 2px;
    border-radius: var(--r-sm);
  }
  ```
  `--ink` dipilih karena lolos kontras di atas cream, pink-soft, **dan** pink-primary.
- Elemen yang bisa diklik harus `<button>` atau `<a>`, bukan `<div onclick>` — biar keyboard & screen reader jalan.
- Gambar dekoratif: `alt=""`. Gambar bermakna: alt yang beneran deskriptif.
- Emoji yang membawa arti kasih `role="img"` + `aria-label`. Emoji dekoratif kasih `aria-hidden="true"`.

---

## 7. Copywriting

- Bahasa Indonesia santai (register lo/gw untuk konteks personal), tapi rapi — bukan alay dengan huruf kapital berlebihan atau tanda seru bertumpuk.
- Satu kalimat, satu maksud.
- Hindari penutup generic ("semoga hari-harimu selalu indah selalu"). Spesifik dan personal jauh lebih kuat daripada template ucapan pasaran. Detail kecil yang cuma kalian berdua tau > kalimat indah yang bisa dikirim ke siapa aja.
- Maks **1 tanda seru** per section. Maks **1 emoji** per paragraf.

---

## 8. Audio

Sama kayak efek visual: **disintesis manual pakai Web Audio API**, bukan file MP3, bukan library. Ga ada asset eksternal, ga ada request tambahan.

### Aturan wajib

- **Ga ada autoplay.** `AudioContext` baru dibikin di dalam event handler interaksi user (`pointerdown` di signature interaction). Browser blokir sebelum itu, dan musik yang nyala sendiri itu ganggu.
- **Tombol mute wajib ada**, posisi tetap, kelihatan dari awal. Pakai `<button aria-pressed="true|false">`, bukan `<div>`.
- **Master gain maks `0.15`.** Sintesis oscillator jauh lebih keras dari yang lo kira. Naikin pelan-pelan pas tes, jangan sekali gas.
- **Berhenti pas tab ga aktif** — `document.addEventListener('visibilitychange', ...)` → suspend `AudioContext`. Musik dari tab background itu bikin orang panik nyari sumbernya.
- **Satu `AudioContext` per halaman.** Bikin ulang tiap not = memory leak.
- `prefers-reduced-motion` **bukan** proxy buat audio — orang bisa mau animasi pelan tapi tetep mau musik. Perlakukan terpisah.

### Preset instrumen

Dua-duanya: `sine` fundamental + harmonik, envelope exponential decay, lowpass biar ga cempreng.

```
Music box (celesta)          Kalimba
  partial: 1.0  gain 1.00      partial: 1.0  gain 1.00
  partial: 2.0  gain 0.25      partial: 2.0  gain 0.18
  partial: 3.01 gain 0.08      partial: 4.7  gain 0.05
  attack  0.005s               attack  0.008s
  decay   1.4s                 decay   0.9s
  lowpass 4000Hz               lowpass 2600Hz
```

Music box = lebih berdenting & nostalgik. Kalimba = lebih hangat & bulat. Pilih satu, jangan campur dalam satu halaman.

### Melodi

"Happy Birthday to You" — **public domain sejak 2016**, aman dipakai. Tempo ~100 BPM, rasa 3/4.

Ga usah pakai reverb convolver (butuh file impulse = asset eksternal). Kesan ruang cukup pakai feedback delay pendek (`delayTime` 0.12s, feedback 0.25) — murah, dan cukup.

### Input mikrofon (deteksi tiupan)

Ini fitur paling gampang gagal di halaman ini. Perlakukan sebagai **bonus, bukan syarat**.

**Syarat yang di luar kendali kode:**
- `getUserMedia` cuma ada di **secure context** — HTTPS atau `localhost`. Dari `file://` API-nya ga eksis sama sekali.
- Browser dalam aplikasi (WhatsApp, Instagram, Facebook) sering blokir mikrofon. Kalau link disebar lewat chat, siapin kalimat "buka di Safari/Chrome".

**Aturan wajib:**
- **Selalu ada jalur manual.** Tombol fallback muncul kalau: API ga ada, izin ditolak, atau 12 detik ga kedeteksi tiupan. Halaman ini ga boleh punya jalan buntu.
- **Matikan pemrosesan audio browser** waktu minta stream:
  ```js
  { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }
  ```
  `noiseSuppression` justru ngebuang derau angin — persis sinyal yang mau dideteksi.
- **`track.stop()` begitu selesai.** Indikator "sedang merekam" yang nyala terus di HP orang itu bikin ga nyaman. Ini bukan optimasi, ini sopan santun.
- **Audio ga pernah keluar dari device**, dan **tulis itu di layar**. Satu kalimat kecil sebelum minta izin. Orang berhak tau sebelum ngasih akses mikrofon.
- **Jangan bunyiin musik selama fase deteksi.** Speaker → mikrofon = tiupan palsu.

**Cara deteksi:** tiupan bukan sekadar "keras". Teriak dan tepuk tangan juga keras. Tandanya adalah **energi pita rendah (< ~300Hz) yang dominan dan bertahan**:
- Kalibrasi derau ruangan ~600ms pertama, ambil sebagai baseline. Jangan pakai ambang angka mati — kamar sepi dan kamar berkipas beda jauh.
- Syarat: energi pita rendah > baseline + margin, **dan** rasio rendah:tinggi di atas ~1.6, **dan** bertahan ≥250ms.
- Sekali lilin mati, jangan nyalain lagi walaupun tiupannya berhenti. Balik ke keadaan awal itu bikin frustrasi, bukan bikin nantang.

---

## 9. Checklist sebelum lapor selesai

Warna & tipografi:
- [ ] Warna dominan halaman adalah pink, bukan campur rata semua warna
- [ ] `--pink-primary` tidak dipakai sebagai warna teks di manapun
- [ ] Semua teks lolos kontras sesuai tabel di §2 (cek yang di atas background pink)
- [ ] Font display cuma di heading, bukan di body
- [ ] Cuma 2 font family, weight yang di-load cuma yang kepake

Layout & motion:
- [ ] Semua spacing dari skala `--sp-*`, ga ada angka ngasal
- [ ] Tepat 1 signature interaction di halaman ini
- [ ] `prefers-reduced-motion` dihormati — termasuk canvas di-skip total, bukan cuma dipercepat
- [ ] Ga ada animasi >1 detik selain signature

Fungsional:
- [ ] Dicek di 375px: ga ada horizontal scroll, ga ada teks kepotong
- [ ] Interaksi utama dites di touch (atau minimal pakai Pointer Events, bukan mouse-only)
- [ ] Semua elemen interaktif punya focus ring yang kelihatan
- [ ] Bisa di-tab dari atas ke bawah tanpa nyangkut

Audio:
- [ ] Ga ada suara sebelum user interaksi (dites: reload → diem)
- [ ] Tombol mute kelihatan, jalan, punya `aria-pressed`
- [ ] Suara berhenti pas pindah tab
- [ ] Volume dites pakai headphone — ga bikin kaget

Mikrofon:
- [ ] Izin ditolak → tombol manual muncul, halaman tetap bisa diselesaikan
- [ ] API ga ada (`file://`) → langsung mode manual, tanpa error
- [ ] Ga ada tiupan 12 detik → tombol manual muncul sendiri
- [ ] `track.stop()` kepanggil — indikator rekam di HP mati
- [ ] Ga ada musik jalan selama fase deteksi
- [ ] Ada kalimat di layar yang bilang audionya ga dikirim ke mana-mana

Font sambung:
- [ ] Maks 2 baris di seluruh halaman
- [ ] Semua ≥24px, ga ada uppercase, ga ada letter-spacing
- [ ] Ga dipakai di tombol/label/instruksi

Copy:
- [ ] Dibaca ulang — ga ada kalimat lebay, emoji ga bertumpuk
- [ ] Ga ada kalimat penutup template/pasaran
