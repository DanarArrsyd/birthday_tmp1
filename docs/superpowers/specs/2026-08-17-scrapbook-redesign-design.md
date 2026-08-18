# Spec — Redesign Scrapbook

Tanggal: 2026-08-17
Status: disetujui, siap dibuatkan rencana implementasi

## 1. Ringkasan

Mengganti tema halaman ulang tahun Dinar dari *playful pink* menjadi **scrapbook kraft/coklat**, dan mengubah strukturnya dari tiga slide vertikal menjadi **buku yang dibuka lalu digeser**.

Kue lilin tidak lagi menjadi layar pembuka yang berdiri sendiri. Kue duduk di atas **sampul buku**. Meniup lilin adalah sebab yang membuka sampul — bukan adegan pembuka yang menempel di depan.

Tujuan: halaman ini harus terasa **dibuat**, bukan dibeli. Pergeseran dari bahasa "kartu ucapan" ke bahasa "gw ngumpulin ini buat lo".

## 2. Ruang lingkup

**Termasuk:**
- Sistem visual baru: palet, tipografi, tekstur, radius, bayangan, motion
- Struktur 7 layar (sampul + 5 lembar + penutup)
- Navigasi geser horizontal berbasis scroll-snap
- Animasi sampul terbuka
- Slot foto dengan bingkai polaroid, washi tape, label tanggal
- Penyesuaian instrumen audio dan warna partikel

**Tidak termasuk (dipertahankan apa adanya):**
- Seluruh logika deteksi tiupan mikrofon dan jalur cadangannya
- Sintesis audio Web Audio API
- Mesin partikel canvas (hanya warna dan bentuk yang berubah)
- Tombol suara, `noindex`, mode `?debug=1`

**Sengaja tidak dikerjakan (YAGNI):**
- Animasi balik halaman 3D (page curl)
- Interaksi buka-tutup di tiap lembar
- Mode gelap
- Musik latar berkelanjutan
- Berbagi ke media sosial

## 3. Struktur — 7 layar

| # | Layar | Isi | Babak |
|---|---|---|---|
| 0 | Sampul | Judul, kue, 16 lilin, status mikrofon | — |
| 1 | Lembar 1 | 1–2 foto masa kecil | Dulu |
| 2 | Lembar 2 | 1–2 foto masa kecil | Dulu |
| 3 | Lembar 3 | 1–2 foto sekarang | Sekarang |
| 4 | Lembar 4 | 1–2 foto sekarang | Sekarang |
| 5 | Lembar 5 | 1 foto + kalimat jembatan ke depan | Harapan |
| 6 | Penutup | Surat + angka `16` + tanda tangan, tanpa foto | Harapan |

Tiap lembar memuat **satu foto besar atau dua polaroid bertumpuk**. Lembar 5 dikunci satu foto agar kalimat jembatannya punya ruang. Kapasitas total **5–9 foto**; dengan 8 foto, susunan yang dipakai adalah 2 / 2 / 2 / 1 / 1.

Sampul berada **di luar** wadah geser. Setelah terbuka, sampul dilepas dari alur dokumen; tidak ada jalan kembali ke kue. Lembar 1 adalah posisi paling kiri.

## 4. Palet

```css
--paper:    #F4EADA;  /* permukaan lembar */
--board:    #6B4A2F;  /* sampul buku */
--espresso: #2E2016;  /* judul, angka display */
--cocoa:    #4A3524;  /* teks utama, label tanggal */
--sepia:    #7A5C3E;  /* teks sekunder */
--rust:     #8F4426;  /* aksen kecil, nomor halaman */
--tape:     #D9C7A3;  /* washi tape — dekoratif */
--sage:     #8A9A78;  /* penyeimbang dingin — dekoratif */
--polaroid: #FFFFFF;  /* bingkai foto */
```

### Kontras terverifikasi

| Teks | Di atas | Rasio | Boleh untuk |
|---|---|---|---|
| `--espresso` | `--paper` | 13,2:1 | semua ukuran |
| `--cocoa` | `--paper` | 9,7:1 | semua ukuran |
| `--rust` | `--paper` | 5,8:1 | semua ukuran |
| `--sepia` | `--paper` | 5,1:1 | semua ukuran |
| `--paper` | `--board` | 6,7:1 | semua ukuran |

`--tape` dan `--sage` tidak pernah menjadi warna teks maupun latar teks. Keduanya murni dekorasi.

Aturan tambahan: teks tidak pernah diletakkan langsung di atas foto. Foto punya bingkai polaroid; caption berada di kertas, bukan di gambar. Ini menghilangkan seluruh kelas masalah kontras teks-di-atas-gambar.

## 5. Tipografi

Tiga famili. Setiap famili punya satu pekerjaan, tidak tumpang tindih.

```html
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Caveat:wght@600&family=Special+Elite&display=swap" rel="stylesheet">
```

| Famili | Peran | Alasan |
|---|---|---|
| **Lora** 400/600 | Badan teks, judul lembar, surat penutup | Serif hangat, terbaca panjang, cocok di atas kertas |
| **Caveat** 600 | Caption tulisan tangan, anotasi di pinggir | Spidol, bukan sambung formal — terbaca jauh lebih baik dari font kaligrafi |
| **Special Elite** 400 | Label arsip: tanggal, nomor halaman, angka display | Mesin tik. Bahasa "dicatat dan diarsipkan" — inti rasa scrapbook |

### Kebijakan angka

Ini aturan yang paling gampang jatuh berantakan, jadi ditetapkan eksplisit.

**Prinsip induk: font angka mengikuti konteks kalimatnya, bukan dipilih satu per satu.** Tidak pernah berganti font di tengah kalimat.

| Konteks | Contoh | Font | Detail |
|---|---|---|---|
| Angka di dalam kalimat | "udah 16 tahun", "3 tahun lalu" | **Lora** | ikut teksnya, `lining-nums` |
| Angka di caption tangan | "kelas 2 SD" | **Caveat** | ikut captionnya |
| Tanggal & label arsip | `14 · 03 · 2010` | **Special Elite** | min 14px, `tabular-nums`, `letter-spacing: .06em`, warna `--cocoa` |
| Nomor halaman | `01` … `06` | **Special Elite** | 14px, warna `--rust` |
| Angka display (umur) | `16` di sampul & penutup | **Special Elite** | 56–72px, `letter-spacing: .04em`, warna `--espresso` |

Alasan angka display memakai Special Elite, bukan dua lainnya:
- **Caveat** terlalu tipis di ukuran besar — goresannya pecah dan kehilangan bobot.
- **Lora** terbaca netral; angka besar bersertif tanpa karakter terbaca seperti nomor halaman buku teks, bukan seperti sesuatu yang distempel.
- **Special Elite** di ukuran besar terbaca sebagai **angka distempel** — persis bahasa yang dipakai album dan arsip.

Batas pemakaian Special Elite: hurufnya sengaja rusak/berbintik, jadi **minimum 14px** dan **hanya untuk string pendek** (tanggal, nomor, angka tunggal). Tidak pernah untuk kalimat. Warna minimum `--cocoa` (9,7:1), tidak boleh `--sepia`, karena tekstur rusaknya mengurangi keterbacaan efektif di bawah angka rasio.

Batas pemakaian Caveat: maksimum 3 baris per lembar, minimum 18px, tanpa `uppercase`, tanpa `letter-spacing`.

## 6. Kertas, radius, bayangan

**Radius nyaris nol.** Kertas tidak punya sudut membulat. Ini pembeda diam-diam terbesar dari tema pink sebelumnya.

```css
--r-paper: 2px;   /* lembar */
--r-cover: 3px;   /* sampul */
--r-photo: 0;     /* polaroid — tajam */
--r-pill: 999px;  /* hanya titik indikator dan tombol bulat */
```

**Bayangan bernada hangat**, bukan abu-abu:

```css
--sh-sheet: 0 6px 18px rgba(46, 32, 22, .18);
--sh-photo: 0 3px 10px rgba(46, 32, 22, .26);
--sh-lift:  0 12px 26px rgba(46, 32, 22, .24);  /* saat lembar disentuh */
```

**Tekstur kertas** dibuat tanpa aset eksternal: satu ubin `feTurbulence` SVG 120×120 sebagai `data:` URI, diulang sebagai `background-image` dengan opasitas rendah di atas `--paper`. Dirasterisasi sekali oleh browser, jadi murah. Tidak memakai `filter:` pada elemen hidup — itu mahal dan memicu repaint saat digeser.

## 7. Navigasi

Wadah geser memakai **scroll-snap native**, bukan drag buatan:

```css
.deck { display: flex; overflow-x: auto; overflow-y: hidden;
        scroll-snap-type: x mandatory; scroll-behavior: smooth; }
.sheet { flex: 0 0 100%; scroll-snap-align: center; }
```

Alasan menolak drag manual dengan pointer events: momentum harus disimulasi sendiri, navigasi keyboard mati, pembaca layar kehilangan konteks, dan di iOS gestur geser dari tepi bentrok dengan gestur "kembali" sistem. Scroll native memberi semua itu gratis.

Pelengkap wajib:
- **Titik indikator** — 6 titik, yang aktif memakai `--rust`. Tanpa ini pengguna sering tidak sadar masih ada lembar berikutnya.
- **Tombol panah** kiri/kanan, 44×44px, tersembunyi dari pembaca layar (`aria-hidden`) karena scroll sudah dapat diakses lewat keyboard.
- `aria-label` per lembar: "Lembar 2 dari 6".

Setiap lembar **wajib muat dalam satu layar**. Patokan: 375×667 (iPhone SE). Anggaran tinggi ≈ 619px setelah padding aman; denah baku memakai ≈ 451px. Lembar yang melebihi ini adalah cacat, bukan preferensi — `overflow-y` di wadah dikunci `hidden` supaya pelanggaran langsung terlihat saat pengembangan.

## 8. Motion

```css
--dur-micro: 150ms;   /* sentuh, angkat */
--dur-base: 300ms;    /* transisi umum */
--dur-cover: 800ms;   /* sampul terbuka */
--ease-paper: cubic-bezier(.22, .8, .3, 1);   /* utama — tenang, berbobot */
--ease-lift: cubic-bezier(.34, 1.3, .64, 1);  /* micro-feedback, pantulan tipis */
```

Easing memantul yang lama (`.34, 1.56, .64, 1`) dibuang. Kertas tidak memantul; itu bahasa karet, milik tema pink.

**Sampul terbuka:** `rotateY(-105deg)` bertumpu `transform-origin: left center`, dengan `perspective: 1400px` pada induknya, 800ms, satu gerakan. Sampul lalu `display: none` supaya tidak menyisakan lapisan komposit.

**Micro-feedback lembar:** saat ditekan, lembar naik (`translateY(-2px)`, bayangan tumbuh) dan polaroid memiringkan diri ≤1° ke arah pointer. 150ms. Tidak ada yang lain.

**Reduced motion:** sampul memudar tanpa rotasi; kemiringan mati; `scroll-behavior: auto`; confetti dilewati sepenuhnya. Kemiringan statis polaroid (−1,5° … 1,5°) **tetap ada** — itu tata letak, bukan gerakan.

## 9. Audio

Instrumen berganti dari music box ke **kalimba** (preset sudah ada di kode). Alasan: timbre kayu lebih menyatu dengan kraft; music box terasa seperti sisa tema sebelumnya.

Sisanya tidak berubah: tanpa autoplay, `AudioContext` lahir dari gestur, master gain 0,15, suspend saat tab tersembunyi, mute hanya menurunkan gain (tidak suspend, karena analyser mikrofon menempel di context yang sama).

Partikel perayaan berubah dari confetti cerah menjadi **sobekan kertas**: hanya memakai warna yang ada di palet §4 — `--paper`, `--tape`, `--board`, `--rust`, `--sage`; bentuk persegi panjang tak beraturan, tanpa lingkaran; rotasi lebih lambat, jatuh lebih berat. Anggaran partikel tidak berubah (150 desktop / 80 mobile, maks 3 detik, `cancelAnimationFrame` + `canvas.remove()`).

## 10. Foto

- **JPEG, lebar maksimum 1200px, target ≤200KB per berkas.** Delapan foto ≈ 1,6MB.
- Disimpan di `assets/photos/`, penamaan `01-<slug>.jpg` sesuai urutan lembar.
- `loading="lazy"` untuk lembar di luar layar, `decoding="async"`.
- Kotak rasio tetap (`aspect-ratio`) supaya tidak ada pergeseran tata letak saat foto masuk.
- **Setiap foto wajib punya `alt` deskriptif yang ditulis pengguna.** Tidak boleh dikarang — isi foto tidak diketahui saat implementasi. Slot `alt` kosong adalah pemblokir rilis, bukan catatan kecil.
- Foto hilang atau gagal dimuat: slot menampilkan bingkai polaroid kosong bertuliskan label tanggal saja. Halaman tidak rusak.

## 11. Berkas & komponen

Pemisahan tetap tiga berkas. `script.js` sudah 555 baris dan akan bertambah, jadi dipecah menjadi modul-modul beranotasi jelas di dalam satu berkas (bukan berkas terpisah — proyek ini tanpa build tool, dan banyak `<script>` menambah request).

| Modul | Tanggung jawab | Bergantung pada |
|---|---|---|
| `AUDIO` | sintesis nada, analyser mikrofon, mute | — |
| `MELODY` | penjadwalan Happy Birthday | `AUDIO` |
| `PARTICLES` | sobekan kertas di canvas | — |
| `CAKE` | lilin, deteksi tiupan, jalur cadangan | `AUDIO` |
| `COVER` | animasi sampul terbuka, serah terima ke deck | `CAKE` |
| `DECK` | scroll-snap, titik indikator, tombol panah | — |

Batas antarmodul: `CAKE` tidak tahu apa pun tentang `DECK`. `CAKE` selesai → memanggil satu callback → `COVER` membuka → `DECK` mengambil alih. Rantai satu arah, tanpa saling memanggil balik.

## 12. Penanganan kegagalan

| Kegagalan | Perilaku |
|---|---|
| Izin mikrofon ditolak | Tombol "Tiup manual" muncul, status berganti, catatan privasi disembunyikan |
| API mikrofon tidak ada (`file://`, browser dalam aplikasi) | Langsung mode manual, pesan berbeda |
| 12 detik tanpa tiupan terdeteksi | Tombol manual muncul, mikrofon tetap jalan |
| Foto gagal dimuat | Bingkai polaroid kosong, halaman tetap utuh |
| Font gagal dimuat | `display=swap` + tumpukan cadangan: serif untuk Lora, cursive untuk Caveat, monospace untuk Special Elite |
| `AudioContext` tidak tersedia | Halaman tetap bisa diselesaikan tanpa suara |
| JavaScript mati | Di luar cakupan — halaman ini memang bergantung pada JS |

## 13. Verifikasi

**Dapat diverifikasi di lingkungan pengembangan:**
- Kontras seluruh pasangan teks terhadap latar terburuk
- Tidak ada scroll horizontal tak disengaja di 375px
- Setiap lembar muat dalam 375×667 — diukur, bukan dilihat
- Scroll-snap berhenti tepat di tiap lembar
- Urutan fokus keyboard, ring fokus terlihat
- Seluruh jalur cadangan mikrofon (ditolak, API tidak ada, batas waktu)
- Berat total halaman dan jumlah request

**Tidak dapat diverifikasi — butuh perangkat pengguna:**
- Deteksi tiupan dengan mikrofon sungguhan; ambang `LOW_MARGIN`, `LOW_MIN`, `RATIO_MIN` disetel lewat `?debug=1` di HP
- Animasi sampul terbuka dan micro-feedback — panel pratinjau melaporkan halaman sebagai `hidden`, sehingga `requestAnimationFrame` beku
- `prefers-reduced-motion` — media query tidak dapat diemulasi di panel pratinjau

Keterbatasan ini dilaporkan apa adanya di akhir implementasi, bukan disembunyikan.

## 14. Privasi & hosting

Repo saat ini **publik** di GitHub Pages. Itu dapat diterima untuk teks placeholder. **Tidak dapat diterima untuk 8+ foto anak berumur 16 tahun.**

Sebelum foto pertama di-commit:
1. Repo dikembalikan menjadi privat.
2. Hosting pindah ke Netlify dengan subdomain acak (HTTPS otomatis, mikrofon tetap berfungsi).
3. `noindex, nofollow` dipertahankan.

Ini pemblokir rilis, bukan saran. Foto tidak boleh masuk ke repo publik walau sesaat — riwayat git bersifat permanen dan dapat ter-cache di luar kendali pengguna.

## 15. Checklist penerimaan

- [ ] Tujuh layar berfungsi: sampul → tiup → terbuka → 5 lembar → penutup
- [ ] Setiap lembar terukur muat dalam 375×667
- [ ] Scroll-snap berhenti tepat; titik indikator sinkron dengan posisi
- [ ] Seluruh pasangan teks lolos WCAG AA terhadap latar terburuk
- [ ] Kebijakan angka dipatuhi: tidak ada pergantian font di tengah kalimat
- [ ] Special Elite tidak pernah di bawah 14px dan tidak pernah untuk kalimat
- [ ] Radius kertas ≤3px di seluruh permukaan kertas
- [ ] Tidak ada easing memantul di luar micro-feedback
- [ ] Ketiga jalur cadangan mikrofon berfungsi
- [ ] Setiap foto punya `alt` yang ditulis pengguna
- [ ] Berat halaman ≤2MB
- [ ] Repo privat dan hosting dipindah sebelum foto di-commit
