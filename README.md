Fitur Sistem:

1. Panel Admin:
   · Menghasilkan kode akses dengan masa berlaku
   · Mengatur nota admin untuk scanner
   · Melihat dan mengelola semua kode yang aktif/dibatalkan
   · Menyalin pautan untuk admin dan scanner
2. Scanner:
   · Validasi kode akses melalui API
   · Tampilan modern dengan efek cyber
   · Fitur quick scan dan deep scan
   · Download hasil scan dalam format teks
   · Timer countdown untuk masa berlaku kode
   · Nota admin yang ditampilkan setelah validasi berhasil
3. Server:
   · API untuk validasi kode
   · Penyimpanan data kode di file JSON
   · Auto-cleanup kode yang telah kadaluarsa

- CARA PASANG PADA TERMUX -
Langkah-langkah Pemasangan di Termux:

1. Install Termux dari F-Droid jika belum ada.
2. Update package dan install Node.js:
   ```bash
   pkg update && pkg upgrade
   pkg install nodejs
   ```
3. Buat direktori proyek:
   ```bash
   mkdir realscan
   cd realscan
   ```
4. Buat file package.json:
   ```bash
   nano package.json
   ```
   Salin konten package.json di atas, lalu simpan (Ctrl+X, Y, Enter).
5. Install dependencies:
   ```bash
   npm install
   ```
6. Buat file server.js:
   ```bash
   nano server.js
   ```
   Salin konten server.js di atas, lalu simpan.
7. Buat direktori public dan data:
   ```bash
   mkdir public
   mkdir data
   ```
8. Buat file admin.html di dalam direktori public:
   ```bash
   nano public/admin.html
   ```
   Salin konten admin.html di atas, lalu simpan.
9. Buat file scanner.html di dalam direktori public:
   ```bash
   nano public/scanner.html
   ```
   Salin konten scanner.html di atas, lalu simpan.
10. Buat file codes.json di dalam direktori data:
    ```bash
    nano data/codes.json
    ```
    Salin konten data/codes.json di atas, lalu simpan.
11. Jalankan server:
    ```bash
    node server.js
    ```
12. Akses aplikasi:
    · Buka browser di perangkat yang sama
    · Akses http://127.0.0.1:3000/admin.html untuk panel admin
    · Akses http://127.0.0.1:3000/scanner.html untuk scanner
