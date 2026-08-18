# DESIGN.md

Design system reference untuk project ini. **Ini satu-satunya sumber kebenaran soal visual** — warna, font, spacing, motion, copy. CLAUDE.md ngatur proses, file ini ngatur rasa.

Baca sebelum nulis/ubah CSS atau markup apapun.

---

## 1. Prinsip Utama

Buatan tangan **bukan berarti berantakan**. Beda tipis tapi krusial:

| Berantakan (HINDARI) | Buatan tangan (PAKAI) |
|---|---|
| Semua elemen dimiringkan acak | Foto miring kecil dan terkontrol (≤2,5°, tiap lembar beda). Washi tape beda urusan: sengaja curam (−38°) karena tape memang ditempel menyilang |
| Washi tape di setiap sudut lembar | Satu sudut per lembar, dan sudutnya bergantian |
| Tekstur kertas pekat sampai teks susah dibaca | Tekstur di opasitas 0,05 — terasa, tidak mengganggu |
| Font tulisan tangan dipakai untuk kalimat panjang | Tulisan tangan hanya untuk 1–3 baris perasaan |
| Angka ganti font tiap muncul | Angka mengikuti konteks kalimatnya |
| Bayangan tebal abu-abu | Bayangan tipis bernada coklat |

Aturan induk: **ketidaksempurnaan dikontrol, bukan asal.** Tape miring dan tekstur kertas itu sengaja dibikin kecil dan konsisten, bukan digenerate acak tiap render. Begitu satu elemen udah jujur "berantakan" (tape miring, kertas bertekstur), elemen di sekitarnya wajib rapi: teks rata kiri dengan measure yang sama, spacing dari satu skala, radius kecil yang konsisten di semua permukaan kertas.

**Signature interaction: tepat 1 per halaman.** Bukan per lembar, bukan per slide. Satu halaman = satu momen yang orang inget: **tiup lilin di sampul**.

Halaman ini punya lima layar (sampul + deck 4 lembar), dan tetap **cuma satu signature**. Lembar-lembar di deck boleh punya interaksi kecil — tap kartu keangkat dikit, titik indikator ganti warna, tombol ganti lembar — tapi harus jelas lebih kecil dari tiup lilin. Kalau ada dua interaksi yang sama-sama minta perhatian, dua-duanya jadi lemah. Sisanya cukup micro-feedback (active state, fade-in) — itu bukan signature, itu sopan santun.

---

## 2. Palet Warna — Kraft/Cokelat

```css
:root {
  --paper:    #F4EADA;  /* permukaan lembar (sheet), warna dasar deck */
  --board:    #6B4A2F;  /* sampul buku (cover), background body */
  --espresso: #2E2016;  /* teks paling gelap — angka umur, penekanan di surat */
  --cocoa:    #4A3524;  /* teks body default, di atas --paper */
  --rust:     #8F4426;  /* aksen — nomor halaman, tanda tangan, titik indikator aktif, garis lilin */
  --sepia:    #7A5C3E;  /* teks sekunder yang tersedia di palet, belum dipakai di markup saat ini */
  --tape:     #D9C7A3;  /* washi tape, isian nyala lilin */
  --sage:     #8A9A78;  /* aksen dekoratif dingin — dipakai di partikel sobekan kertas */
}
```

### Aturan kontras (WAJIB — ini bukan saran)

Rasio kontras terukur, dibulatkan:

| Teks | di atas | Rasio | Boleh dipakai buat |
|---|---|---|---|
| `--espresso` | `--paper` | 13.21:1 | semua ukuran |
| `--cocoa` | `--paper` | 9.65:1 | semua ukuran |
| `--rust` | `--paper` | 5.83:1 | semua ukuran |
| `--sepia` | `--paper` | 5.14:1 | semua ukuran |
| `--paper` | `--board` | 6.66:1 | semua ukuran — teks di sampul |

Konsekuensi praktis:

- **`--tape` dan `--sage` bukan warna teks — titik.** Keduanya dekoratif doang: `--tape` jadi background washi tape dan isian nyala lilin; `--sage` cuma muncul di partikel sobekan kertas (dipakai lewat nilai hex langsung di `script.js`, bukan lewat `var()` di CSS).
- **`--tape` boleh jadi background di belakang teks `--espresso`** (dipakai di penekanan `<em>` pada surat) — bukan di belakang teks warna lain.
- Teks di atas `--board` (sampul) wajib `--paper` — satu-satunya pasangan yang lolos kontras di sana.
- Teks di atas `--paper` (lembar deck) pakai `--espresso`, `--cocoa`, `--rust`, atau `--sepia` — sesuai peran, bukan asal pilih yang paling gelap.
- Butuh warna di luar daftar ini? Minta izin dulu. Jangan improvisasi.

### Dark mode

**Tidak ada dark mode di project ini.** Jangan bikin `@media (prefers-color-scheme: dark)`. Halaman ini satu look, kertas kraft, cokelat hangat. Selesai.

---

## 3. Tipografi

**Tiga family, masing-masing peran fix. Ga boleh nambah.**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Caveat:wght@600&family=Special+Elite&display=swap" rel="stylesheet">
```

- **`--font-body` — Lora, weight 400 (600 buat penegasan).** Body text, caption, tombol, label — semua teks fungsional dan prosa.
- **`--font-hand` — Caveat, weight 600.** Tulisan tangan. Cuma buat satu baris per lembar yang sifatnya perasaan (`.note-hand`, tanda tangan). Bukan buat teks fungsional.
- **`--font-label` — Special Elite, weight 400.** Terlihat kayak mesin tik/stempel. Buat tanggal, nomor halaman, angka umur besar, dan label kecil (kicker sampul, status).
- Load cuma weight yang kepake. Jangan tarik `wght@100..900`.
- `display=swap` wajib, biar teks ga ilang pas font loading.

### Kebijakan angka — baca ini pelan-pelan

Angka **ikut konteks kalimatnya, bukan dipilih per-angka, dan ga pernah ganti font di tengah kalimat**:

- Tanggal (`.stamp-date`), nomor halaman (`.page-no`), dan angka umur besar (`.age-display`) pakai **Special Elite** — karena posisinya sebagai elemen "distempel", bukan bagian dari kalimat.
- Angka yang muncul **di dalam prosa** (misal di baris surat) ikut font prosa itu, yaitu **Lora** — ga pindah ke Special Elite atau Caveat cuma karena dia angka.
- **Special Elite ga pernah di bawah 14px** (`--fs-label`), dan **cuma buat string pendek** (tanggal, nomor, kicker) — ga pernah buat kalimat penuh.
- **Caveat ga pernah di bawah 18px** (`--fs-hand` minimum), **maks 3 baris per lembar**, ga pernah `uppercase`, ga pernah `letter-spacing`.
- `font-variant-numeric: tabular-nums` di tanggal dan nomor halaman (biar digit sejajar rapi, kesan stempel). `font-variant-numeric: lining-nums` di prosa pesan (`.note`) — angka menyatu tinggi sama huruf kapital di sekitarnya, ga naik-turun kayak old-style figures.

### Skala tipografi

```css
--fs-display: clamp(2.75rem, 14vw, 4.5rem); /* angka umur, Special Elite */
--fs-h1:      clamp(1.75rem, 5.5vw, 2.25rem);
--fs-h2:      clamp(1.375rem, 4vw, 1.625rem);
--fs-body:    1rem;                          /* 16px */
--fs-hand:    clamp(1.125rem, 4.5vw, 1.375rem); /* min 18px — Caveat */
--fs-label:   0.875rem;                      /* 14px — plafon bawah Special Elite */
```

Body line-height `1.6`. Body text max-width `60ch` — kalimat kepanjangan susah dibaca.

---

## 4. Spacing & Radius

Base 4px. Cuma pakai angka dari skala ini — jangan `margin: 27px`.

```css
--sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
--sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px; --sp-9: 96px;
```

```css
--r-paper: 2px;   /* permukaan kertas: tombol, lembar, kue */
--r-cover: 3px;   /* sampul buku */
--r-pill:  999px; /* HANYA kontrol bulat: titik indikator, tombol ikon suara/panah. Bukan permukaan kertas. */
```

Kertas scrapbook itu nyaris kotak. **Semua permukaan kertas ≤3px radius** — kalau ada card baru yang butuh sudut membulat gede, itu tanda dia bukan permukaan kertas dan harus dipikir ulang, bukan asal pakai `--r-lg` yang ga ada di sistem ini.

### Shadow

Bayangan warna-tinted (coklat hangat), bukan abu-abu generik, biar nyatu sama tema:

```css
--sh-sheet: 0 6px 18px rgba(46, 32, 22, .18);  /* lembar & sampul, diam */
--sh-photo: 0 3px 10px rgba(46, 32, 22, .26);  /* tombol, kue, elemen kecil */
--sh-lift:  0 12px 26px rgba(46, 32, 22, .24); /* state terangkat — active/press */
```

Semuanya pakai basis rgba yang sama, `46, 32, 22` (espresso), cuma beda opacity/spread sesuai seberapa "terangkat" elemennya. Jangan `rgba(0,0,0,0.5)` — berat dan bikin kotor.

---

## 5. Motion

### Durasi

```css
--dur-micro:  150ms;  /* hover, press, toggle kecil */
--dur-base:   300ms;  /* transisi elemen, fade-in */
--dur-cover:  800ms;  /* sampul kebuka, serah terima ke deck — momen utama halaman */
```

Kalau ada animasi lebih dari 1 detik yang bukan buka-sampul — itu kelamaan, potong.

### Easing

```css
--ease-paper: cubic-bezier(.22, .8, .3, 1);   /* buka sampul, fade, transisi tenang */
--ease-lift:  cubic-bezier(.34, 1.3, .64, 1); /* micro-feedback: tombol ditekan, kartu keangkat */
```

Easing memantul-mantul lama **sengaja dibuang dari sistem ini**. Kertas ga mantul — begitu ditekan atau diangkat dia berhenti mulus, ga ada overshoot yang niru karet/plastik. `--ease-lift` punya sedikit overshoot terkontrol buat micro-feedback, tapi jauh lebih halus dari easing memantul versi lama.

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

Blok global ini bukan pengganti berpikir: efek canvas (sobekan kertas) **di-skip total**, bukan cuma dipercepat — cek `matchMedia('(prefers-reduced-motion: reduce)').matches` di JS sebelum jalanin.

### Budget efek canvas (sobekan kertas dkk)

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
    outline: 3px solid var(--paper);
    outline-offset: 2px;
    border-radius: var(--r-paper);
  }
  ```
  `--paper` dipilih karena lolos kontras di atas `--board` (sampul) **dan** di atas `--paper`/lembar deck.
- Elemen yang bisa diklik harus `<button>` atau `<a>`, bukan `<div onclick>` — biar keyboard & screen reader jalan.
- Halaman ini sengaja tanpa gambar sama sekali. Kalau nanti ada gambar bermakna, alt-nya wajib ditulis manusia — bukan placeholder.
- Emoji yang membawa arti kasih `role="img"` + `aria-label`. Emoji dekoratif kasih `aria-hidden="true"`.

### Struktur & navigasi deck

Halaman ini punya **lima layar**: sampul (kue + 16 lilin), lalu deck geser horizontal berisi **empat lembar** — satu lembar per pengirim (Ayah, Ibu, Kakak), ditutup satu lembar surat bersama. Tanpa foto: tiap lembar isinya pesan dalam beberapa paragraf, ditutup tanda tangan tulisan tangan. Label pengirim di atas lembar sengaja tidak ada — tiap pesan sudah menyebut penulisnya di kalimat pertama, jadi label itu cuma mengulang.

**Tiga pengirim tidak boleh terlihat sama.** Pembedanya tiga sumbu kecil, semuanya diambil dari sistem yang sudah ada — bukan tema terpisah:

| Lembar | Tinta tanda tangan | Sudut tape | Kemiringan kertas |
|---|---|---|---|
| Ayah | `--espresso` (13,2:1) | kiri-atas, −38° | −0,8° |
| Ibu | `--rust` (5,8:1) | kanan-atas, +38° | +0,6° |
| Kakak | `--sepia` (5,1:1) | kiri-atas, −24° | −1,2° |
| Penutup | `--rust` | kiri-atas, −38° | **0° — sengaja lurus** |

### Kertas sebagai benda

Dua ornamen, dan dua-duanya soal **kertasnya sebagai benda** — bukan motif yang ditempel di atasnya. Balon, ikon, dan gambar tempel sengaja ditolak: itu bahasa clip-art, dan begitu masuk, semua kerja bikin kertas, tape, dan tulisan tangan ketarik turun jadi kartu ucapan toko. Momen meriahnya sudah punya tempat sendiri — sobekan kertas yang meledak pas lilin mati. Kalau tiap lembar juga meriah, momen itu kehilangan kontras.

- **Tepi bawah sobek.** Tepi lurus sempurna adalah kebocoran paling besar bahwa ini sebuah `div`. Dibuat dari mask dua lapis: satu ubin SVG setinggi `--tear-h` menempel di bawah, satu blok solid untuk sisa badan. Lebar ubin dibedakan per pengirim (57/68/63/61px) supaya pengulangan polanya tidak sejajar antar lembar. Browser tanpa dukungan `mask` cuma dapat persegi rapi — turun pelan, bukan rusak.
- **Bekas lipatan.** Satu garis samar melintang di `.paper::before`, ketinggiannya beda tiap lembar (38/45/34/52%).

**Washi tape wajib berada di luar `.paper`.** Mask sobekan memotong semua yang menjorok keluar kotak kertas, dan justru overhang itulah yang bikin tape terbaca sebagai tape. Karena itu ada `.paper-wrap`: dia yang memegang lebar, rotasi, dan efek terangkat, dan dia tidak di-mask. Tape menempel di wrapper, bukan di kertas — sama seperti di dunia nyata, tape memegang kertas dari luar.

Konsekuensi tata letak: `--tear-h` harus ditambahkan ke padding bawah `.paper`, dan `.page-no` dinaikkan setinggi itu juga. Kalau tidak, teks dan nomor halaman jatuh ke daerah yang dipotong.

Tinta paling gelap dan paling tenang untuk Ayah, yang memang menulis bahwa dirinya tidak banyak bicara. Lembar penutup tidak dimiringkan karena itu suara bersama, bukan satu tangan.

- **Navigasi deck pakai `scroll-snap` CSS native** (`scroll-snap-type: x mandatory` di `.deck`, `scroll-snap-align: center` di `.sheet`) — **bukan** pointer-drag manual bikinan sendiri. Tombol panah dan titik indikator manggil `scrollTo`/`scrollIntoView`, browser yang urus snapping-nya.
- **`overflow-y: hidden` di `.deck` itu load-bearing, bukan kosmetik.** Kalau satu lembar kontennya kelebihan tinggi, dia bakal kepotong dan keliatan cacat — bukan diam-diam jadi bisa di-scroll vertikal dan nyembunyiin masalahnya. Setiap lembar **wajib muat dalam tinggi konten 619px** di viewport 375×667.
- **Titik indikator (`.dots`) harus sinkron dengan lembar yang lagi keliatan** — `aria-current="true"` pindah ke titik yang sesuai index lembar aktif, bukan ketinggalan pas user swipe cepat.
- Aturan `[hidden] { display: none !important; }` di global CSS **itu load-bearing juga**: deklarasi `display` dari component rule (misal `.deck { display: flex; }`) mengalahkan aturan `[hidden]` bawaan browser diam-diam, tanpa error. Kalau ga ada `!important` di aturan global ini, elemen yang dikasih atribut `hidden` bisa tetap keliatan.

---

## 7. Copywriting

- Bahasa Indonesia yang hangat tapi rapi. **Sapaan ke penerima: "kamu". Dilarang pakai "lo"/"gw"** — pengirimnya Ayah, Ibu, dan Kakak, dan register itu ga cocok dari orang tua. Bukan juga bahasa alay dengan huruf kapital berlebihan atau tanda seru bertumpuk.
- Aturan sapaan ini berlaku ke **semua** teks yang tampil, bukan cuma surat: status mikrofon, catatan privasi, dan label tombol ikut.
- Satu kalimat, satu maksud.
- Hindari penutup generic ("semoga hari-harimu selalu indah selalu"). Spesifik dan personal jauh lebih kuat daripada template ucapan pasaran. Detail kecil yang cuma kalian berdua tau > kalimat indah yang bisa dikirim ke siapa aja.
- Maks **1 tanda seru** per section. Maks **1 emoji** per paragraf.

---

## 8. Audio

Sama kayak efek visual: **disintesis manual pakai Web Audio API**, bukan file MP3, bukan library. Ga ada asset eksternal, ga ada request tambahan.

### Aturan wajib

- **Ga ada autoplay.** `AudioContext` baru dibikin di dalam event handler interaksi user (`pointerdown` di signature interaction). Browser blokir sebelum itu, dan musik yang nyala sendiri itu ganggu.
- **Tombol mute wajib ada**, posisi tetap, kelihatan dari awal. Pakai `<button aria-pressed="true|false">`, bukan `<div>`.
- **Master gain `0.45`, dengan `DynamicsCompressorNode` sebelum destination.** Angka ini hasil ukur, bukan kira-kira: melodi dirender ulang di `OfflineAudioContext`, dan pada `0.15` hasilnya RMS −30,4 dBFS — terlalu pelan lewat speaker ponsel. Pada `0.45` RMS naik ke −17,4 dBFS dengan puncak masih −3,6 dBFS.
- **Kompresornya bukan hiasan.** Melodi ini decay-nya 0,9 detik dengan jarak nada 0,6 detik, jadi selalu ada dua nada berbunyi bersamaan. Menaikkan master tanpa kompresor sama saja bertaruh pada clipping.
- **Kalau menaikkan `MASTER`, turunkan level desis kertas dengan faktor yang sama.** Desis itu latar; begitu dia menyaingi melodi, dia berubah jadi gangguan.
- **Berhenti pas tab ga aktif** — `document.addEventListener('visibilitychange', ...)` → suspend `AudioContext`. Musik dari tab background itu bikin orang panik nyari sumbernya.
- **Satu `AudioContext` per halaman.** Bikin ulang tiap not = memory leak.
- `prefers-reduced-motion` **bukan** proxy buat audio — orang bisa mau animasi pelan tapi tetep mau musik. Perlakukan terpisah.

### Preset instrumen

Dua-duanya: `sine` fundamental + harmonik, envelope exponential decay, lowpass biar ga cempreng.

```
Kalimba (default)            Music box (celesta, preset alternatif)
  partial: 1.0  gain 1.00      partial: 1.0  gain 1.00
  partial: 2.0  gain 0.18      partial: 2.0  gain 0.25
  partial: 4.7  gain 0.05      partial: 3.01 gain 0.08
  attack  0.008s                attack  0.005s
  decay   0.9s                  decay   1.4s
  lowpass 2600Hz                lowpass 4000Hz
```

Kalimba dipakai sebagai default karena timbre-nya kayu, lebih menyatu sama tema kraft. Music box tetap ada di kode sebagai preset alternatif (`INSTRUMENTS.musicbox`) — lebih berdenting & nostalgik, tinggal ganti `CURRENT` kalau suatu saat mau dipakai. Pilih satu, jangan campur dalam satu halaman.

### Melodi

"Happy Birthday to You" — **public domain sejak 2016**, aman dipakai. Tempo ~100 BPM, rasa 3/4.

### Desis kertas saat ganti lembar

Satu noise pendek lewat bandpass 1800Hz (Q 0,8), attack 4ms, decay 140ms. Disintesis seperti nada lain — bukan berkas audio.

Dua aturan yang mengikat:

- **Fungsinya tidak boleh memanggil `ensure()`.** Kalau `AudioContext` belum lahir dari tombol Mulai, dia diam saja. Menghidupkan audio dari pergantian lembar berarti membuat context di luar gestur — persis yang dilarang di bagian atas §8.
- **Hanya berbunyi kalau lembarnya benar-benar berganti.** `init()` dan `reveal()` sama-sama memanggil `setActive(0)` sementara indeksnya sudah 0, jadi pembukaan deck tidak ikut berdesis. Ketukan panah di ujung deck juga ditolak lebih dulu oleh penjaga batas, jadi tidak ada desis tanpa perpindahan.

Ga usah pakai reverb convolver (butuh file impulse = asset eksternal). Kesan ruang cukup pakai feedback delay pendek (`delayTime` 0.12s, feedback 0.25) — murah, dan cukup.

### Partikel perayaan

Efek visual pas lilin mati adalah **sobekan kertas**, bukan partikel foil berkilau — canvas dengan class `.scraps`, warnanya diambil langsung dari token palet (`--paper`, `--tape`, `--board`, `--rust`, `--sage`). Bentuknya persegi panjang kecil yang mutar pelan, konsisten sama tema kertas & scrapbook. Budget performa dan aturan reduced-motion-nya sama kayak efek canvas manapun — lihat §5.

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
- [ ] Warna dominan halaman adalah kraft/cokelat dari palet §2, bukan campur rata semua warna
- [ ] `--tape` dan `--sage` tidak dipakai sebagai warna teks di manapun
- [ ] Semua teks lolos kontras sesuai tabel di §2
- [ ] Radius seluruh permukaan kertas ≤3px
- [ ] Cuma 3 font family, weight yang di-load cuma yang kepake

Angka:
- [ ] Special Elite tidak pernah di bawah 14px dan tidak pernah untuk kalimat
- [ ] Caveat tidak pernah di bawah 18px, maksimum 3 baris per lembar
- [ ] Tidak ada pergantian font angka di tengah kalimat

Layout & motion:
- [ ] Semua spacing dari skala `--sp-*`, ga ada angka ngasal
- [ ] Tepat 1 signature interaction di halaman ini (tiup lilin)
- [ ] `prefers-reduced-motion` dihormati — termasuk canvas di-skip total, bukan cuma dipercepat
- [ ] Ga ada animasi >1 detik selain buka-sampul

Fungsional:
- [ ] Dicek di 375px: ga ada horizontal scroll, ga ada teks kepotong
- [ ] Setiap lembar terukur ≤619px tinggi di viewport 375×667
- [ ] Titik indikator sinkron dengan lembar yang sedang tampil
- [ ] Interaksi utama dites di touch (atau minimal pakai Pointer Events, bukan mouse-only)
- [ ] Semua elemen interaktif punya focus ring yang kelihatan
- [ ] Bisa di-tab dari atas ke bawah tanpa nyangkut
- [ ] Ga ada "lo"/"gw" di teks yang tampil, termasuk status mikrofon dan label tombol
- [ ] Tiga lembar pengirim beda tinta, sudut tape, dan kemiringan — lembar penutup tetap lurus
- [ ] Washi tape masih menjorok keluar tepi kertas (bukti tape tidak ikut terpotong mask)
- [ ] Nomor halaman tidak jatuh di zona sobekan
- [ ] Desis kertas berbunyi tepat sekali per pergantian lembar, dan nol saat deck dibuka
- [ ] Ganti lembar sebelum menekan Mulai tidak membuat `AudioContext` sama sekali

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

Copy:
- [ ] Dibaca ulang — ga ada kalimat lebay, emoji ga bertumpuk
- [ ] Ga ada kalimat penutup template/pasaran
