# Foto scrapbook

## Cara memasukkan foto lo

1. **Siapkan 8 file foto** dan beri nama sesuai urutan:
   - `01.jpg`, `02.jpg`, `03.jpg`, `04.jpg`
   - `05.jpg`, `06.jpg`, `07.jpg`, `08.jpg`

2. **Letakkan semua file di folder ini** (`assets/photos/`).

3. **Buka `index.html`** dan cari tulisan `[GANTI-ALT: ...]`. Ganti tiap satu dengan penjelasan singkat apa isi foto itu. Contoh:
   - `alt="Dinar naik sepeda di taman, umur 8 tahun"`
   - `alt="Duduk di sofa sambil main game"`

4. **Jangan commit ke repo publik** — lihat peringatan di bawah.

## Persyaratan tiap foto

| Kriteria | Target |
|----------|--------|
| Format | JPEG (`.jpg`) |
| Ukuran lebar maksimal | 1200 px |
| Ukuran file per foto | ≤ 200 KB (lebih ringan lebih bagus) |
| Total semua foto | ≤ 2 MB |
| Rasio (potret/landscape) | Bebas — akan dipotong otomatis ke 4:3 |

## Tata letak di halaman

| Foto | Lembar | Tema | Teks pendamping |
|-----|--------|------|-----------------|
| `01.jpg`, `02.jpg` | 1 | Dulu | "Lo yang ini, ga pernah mau diem." |
| `03.jpg`, `04.jpg` | 2 | Dulu | "Masih sama berisiknya, cuma makin gede." |
| `05.jpg`, `06.jpg` | 3 | Sekarang | "Fase paling rusuh, jujur kita kangen itu." |
| `07.jpg` | 4 | Sekarang | "Udah mulai punya gaya sendiri." |
| `08.jpg` | 5 | Harapan | "Dan sekarang lo di sini." |

## PENTING: Keamanan foto

**Foto lo TIDAK akan masuk ke GitHub sampai lo nggak mau.** Kenapa? Repo ini sekarang publik, dan foto pribadi seharusnya nggak di-share ke internet tanpa lo mau.

Aturan blokir di `.gitignore` akan:
- ✅ Membuat **semua file** di folder ini tidak tercatat di git — apa pun formatnya (`.jpg`, `.png`, `.heic`, `.webp`)
- ✅ Foto tetap bisa ditampilkan di browser lo saat buka halaman lokal
- ❌ **Jadi foto nggak bisa di-push ke GitHub** sampai lo buka blokir itu

### Kapan boleh buka blokir?

Bukalah blokir **SETELAH** lo:
1. Pindah repo ini ke **privat** di GitHub (Settings → Change to private)
2. Pindah hosting ke **Netlify** atau layanan lain yang support HTTPS
3. Yakin hanya orang yang lo mau yang bisa akses

Setelah itu:
- Buka `.gitignore`, lalu hapus **empat baris komentar DAN tiga baris pola di bawahnya** —
  dari baris `# Foto dilarang masuk repo publik` sampai baris `!assets/photos/README.md`.
  Kalau lo cuma hapus baris komentarnya, blokirnya masih aktif dan foto tetap nggak keangkat.
- Lakukan `git add` ke foto dan `git commit` seperti biasa
- Sekarang foto bisa di-push ke GitHub privat dengan aman

Jangan buka blokir sebelum itu — orang random di internet bisa lihat foto lo.

### Satu hal lagi

Blokir ini menahan perintah `git add` biasa. Dia **tidak** menahan `git add -f`
(huruf `f` artinya "paksa"). Jadi kalau lo nemu tutorial di internet yang nyuruh
nambahin `-f` supaya file "mau ke-add", jangan diikutin — itu persis yang bikin
foto lolos ke repo publik.
