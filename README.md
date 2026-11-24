# Plant Care (0217_PlantCare)

Aplikasi perawatan tanaman hias: kelola kategori dan koleksi tanaman, atur jadwal perawatan, dan catat pertumbuhan lewat jurnal bergambar.

Project Akhir Pengembangan Aplikasi Mobile 2026 (Jetpack Compose, MVVM, Navigation Compose).
Dibuat oleh Akmall (NIM 20240140217, Kelas E).

## Teknologi

- **Android:** Kotlin, Jetpack Compose, MVVM, Navigation Compose, Retrofit
- **Backend:** Node.js, Express JS, JWT, bcrypt
- **Database:** PostgreSQL cloud (Neon)

## Struktur Repository

```
0217_PlantCare/
  backend/     REST API (Express + PostgreSQL)
  app/         Aplikasi Android (Jetpack Compose)
```

## Menjalankan Backend

```bash
cd backend
npm install
cp .env.example .env     # lalu isi DATABASE_URL dan secret
npm run migrate          # membuat tabel
npm run seed             # membuat akun admin
npm run dev              # server di http://localhost:3000
```

Cek koneksi: buka `http://localhost:3000/api/health`.

## Status Fitur

| Fitur | Status |
|---|---|
| Setup backend dan koneksi database | Selesai |
| Autentikasi (register, login, JWT, refresh token) | Selesai |
| Kategori (CRUDS) | Selesai |
| Tanaman (CRUDS) | Selesai |
| Jenis Perawatan (CRUDS) | Selesai |
| Jadwal Perawatan (CRUDS) | Selesai |
| Jurnal Pertumbuhan (CRUDS + foto lokal) | Selesai |
| Role-based UI (admin dan user) | Selesai |
| Penyimpanan file lokal | Selesai |

## 4. Progress Mingguan (Weekly Progress)

Berikut adalah linimasa pengembangan proyek PlantCare yang direkonstruksi secara riil berdasarkan riwayat git commit:

📅 **Minggu 1 (29 Mei 2026 - 2 Juni 2026)**

- **Inisialisasi & Setup Lingkungan** (`35a2990`, `b3feab1`, `8b53133`): Initial commit, konfigurasi `.env.example`, compile/min SDK, izin jaringan, dan registrasi plugin Android.
- **Pondasi Basis Data & Migrasi** (`95a7281`, `e99d39f`, `91f87e7`): Pembuatan skema tabel PostgreSQL (`users`, `refresh_tokens`, `categories`, `plants`, `treatment_types`, `schedules`, `journals`), script migrasi, dan seeding admin.
- **Sistem Autentikasi & Keamanan** (`28b40b4`, `7b3335a`, `a4ca348`): Manajemen register, login, JWT access token, refresh token, pencabutan token saat logout, dan hashing bcrypt.
- **Manajemen Kategori & Jenis Perawatan** (`eeda440`, `6c4582c`, `1ef9c6b`): Implementasi CRUD Kategori Tanaman dan Master Jenis Perawatan (Menyiram, Memupuk, Memangkas, Mengganti Media Tanam).
- **Manajemen Tanaman, Jadwal & Jurnal Bergambar** (`26f6ae5`, `f39b4d6`, `d864f2d`): CRUD Tanaman koleksi pengguna, manajemen jadwal perawatan (deteksi terlambat & jatuh tempo), serta pencatatan jurnal pertumbuhan dengan kompresi foto lokal.
