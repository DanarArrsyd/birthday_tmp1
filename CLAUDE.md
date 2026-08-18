# CLAUDE.md

Instruksi kerja untuk Claude Code di project ini. File ini ngatur **proses & teknis**. Semua keputusan visual (warna, font, spacing, motion, copy) ada di `DESIGN.md` — jangan diulang di sini biar ga drift.

## Tentang project

Website sederhana (HTML/CSS/JS vanilla, tanpa framework/build tool) — scrapbook
ulang tahun: sampul berisi kue yang ditiup, lalu empat lembar pesan yang digeser
horizontal — satu lembar per pengirim (Ayah, Ibu, Kakak), ditutup surat bersama.
Tanpa foto. Ringan, tanpa dependency berat.

Target: **mobile-first**, baseline 375px, browser modern (Chrome/Safari/Firefox terbaru). Ga perlu support IE atau browser lawas.

## Wajib dibaca dulu

Sebelum nulis atau ubah CSS/markup apapun, **baca `DESIGN.md`**. Kalau ragu apakah sesuatu masih terasa buatan tangan atau udah kebablasan jadi berantakan, cek tabel perbandingan di §1 DESIGN.md sebelum nulis kode.

## Struktur file & cara jalanin

Entry point: `index.html` di root.

**Deteksi tiupan butuh secure context**, jadi jangan tes fitur itu lewat `file://` — API mikrofonnya ga eksis di sana. Selalu lewat server lokal (`localhost` dihitung secure):

```bash
python3 -m http.server 8000
```

Buat nyetel ambang deteksi di HP asli, buka dengan `?debug=1` — angka low/high/ratio tampil live di layar.

Bagian non-mikrofon boleh dites cepat tanpa server:

```bash
open index.html
```

Aturan pemisahan file:
- Scope kecil (satu halaman, di bawah ~400 baris total) → boleh single-file `index.html` dengan `<style>` + `<script>` inline.
- Lebih dari itu → pisah jadi `index.html`, `style.css`, `script.js`. Jangan tunggu sampai 1000 baris.

## Aturan teknis

- Vanilla HTML/CSS/JS. Jangan nambahin framework (React/Vue/Tailwind CDN dll) kecuali diminta eksplisit.
- Font eksternal pakai Google Fonts via `<link>`, bukan `@import` (lebih cepat render). Snippet lengkap ada di §3 DESIGN.md.
- Semua interaksi utama (klik, drag, hold) harus jalan di touch device — pakai Pointer Events, bukan mouse-only.
- Struktur CSS: **class-based konsisten**. Jangan campur selector element-based dan class-based buat hal yang sama — bikin override bentrok.
- Semua nilai warna/spacing/radius/durasi ambil dari CSS custom property di `:root` (didefinisikan di DESIGN.md). Jangan hardcode hex atau px di tengah stylesheet.
- Penamaan class: kebab-case, bahasa Inggris (`.hero-card`, `.cta-button`). Copy yang tampil ke user: Bahasa Indonesia, sapaan "kamu" — **jangan pakai "lo"/"gw"**, aturan lengkap di §7 DESIGN.md.
- Semua efek (sobekan kertas, partikel, animasi) dibikin manual pakai canvas/CSS. Ada budget performa di §5 DESIGN.md — patuhi.
- Audio disintesis pakai Web Audio API, bukan file MP3/WAV, bukan library. Aturan lengkap di §8 DESIGN.md. Ga ada autoplay — audio cuma boleh mulai dari gesture user.

## Aturan rilis

**Setiap kali `style.css` atau `script.js` berubah, naikkan `?v=` pada dua tag di `index.html`.**

GitHub Pages mengirim `cache-control: max-age=600` untuk semua berkas. Tanpa penanda versi, HP yang pernah membuka halaman ini bisa mendapat HTML baru berpasangan dengan CSS lama dari cache. Hasilnya lembar tampil rusak, dan satu-satunya penyembuhnya adalah hard refresh — yang tidak akan pernah dilakukan penerima kado.

Aturan turunannya: **efek hiasan tidak boleh menentukan apakah isi terlihat.** Versi awal tepi sobek memakai mask berlapis pada `.paper`; begitu satu lapis gugur di Safari iOS, seluruh tulisan ikut hilang. Efek semacam itu harus ditimpa di atas (`::after`), bukan memotong wadah isinya.

## Yang TIDAK boleh dilakukan tanpa izin eksplisit

- Ganti atau nambah warna di luar palet di §2 DESIGN.md
- Nambah dependency/library eksternal (library efek partikel, animation library, GSAP, dst)
- Ubah struktur jadi pakai build tool (Vite, webpack, dst)
- Bikin dark mode (project ini sengaja satu look — lihat §2 DESIGN.md)
- Nambah signature interaction kedua — tiup lilin adalah satu-satunya
- Ganti scroll-snap jadi drag berbasis pointer (alasan penolakannya ada di §6 DESIGN.md)

## Workflow tiap task

1. Baca `DESIGN.md` kalau task menyentuh visual/UI
2. Kerjain perubahan
3. Buka `index.html` di browser, cek di lebar 375px **dan** desktop
4. Jalanin checklist §9 DESIGN.md — jangan lapor selesai sebelum semua item kecek
5. Lapor apa yang belum sempat dites, jangan diem-dieman
