# Panduan Testing Aplikasi ManagemenKos 🏢

Dokumen ini berisi panduan alur pengujian (testing) aplikasi ManagemenKos dari sisi masing-masing role (Admin, Manager, dan User).

---

##  1. Kredensial Akun untuk Testing
Gunakan akun-akun berikut (yang telah dibuat melalui Seeder) untuk login ke dalam aplikasi:

###  Admin
- **Email:** `admin@nestin.id`
- **Password:** `password123`

###  Manager
- **Email:** `mng_1@nestin.id` (atau `mng_2@nestin.id`)
- **Password:** `password123`

###  User (Penyewa Kos)
- `budi.santoso@gmail.com`
- `siti.aminah@gmail.com`
- `agus.pratama@gmail.com`
- `rini.wulandari@gmail.com`
- `joko.susilo@gmail.com`

**Password untuk semua user:** `password123`

---

##  2. Alur Pengetesan per Role

### A. Skenario Testing: User (Penyewa Kos)
1. **Login:** Gunakan salah satu akun user (misal `budi.santoso@gmail.com`).
2. **Lihat Daftar Kamar:** 
   - Arahkan ke halaman utama/daftar kamar.
   - Coba ubah-ubah filter (tipe kamar, ketersediaan, dsb.) jika tersedia di antarmuka.
3. **Pemesanan (Booking):**
   - Lakukan simulasi booking pada kamar yang berstatus **TERSEDIA**.
4. **Dashboard User / Riwayat:**
   - Masuk ke dashboard profil/user.
   - Periksa apakah kamar yang baru saja dipesan muncul di riwayat tagihan/pemesanan.

### B. Skenario Testing: Manager
1. **Login:** Gunakan akun manager (`mng_1@nestin.id`).
2. **Dashboard Manager:**
   - Navigasi ke halaman khusus manajemen atau laporan.
   - Pastikan manager dapat memantau data ketersediaan kamar, total user yang menyewa, dan performa keuangan (jika ada fiturnya).
3. **Verifikasi/Approve Booking (Jika berlaku):**
   - Apabila aplikasi menerapkan persetujuan dari Manager untuk setiap booking, masuk ke menu reservasi/booking.
   - Lakukan approval atau rejection pada booking yang baru saja dibuat oleh User.

### C. Skenario Testing: Admin (Super Admin)
1. **Login:** Gunakan akun admin (`admin@nestin.id`).
2. **Manajemen Kamar (CRUD):**
   - Buka menu Manajemen Kamar.
   - **Create:** Coba tambah kamar baru dengan mengisi nomor kamar, tipe, dan harga dasar.
   - **Read:** Pastikan daftar kamar termuat dengan baik (termasuk yang baru saja ditambahkan) beserta strategi pricing-nya.
   - **Update:** Edit deskripsi, fasilitas, atau harga salah satu kamar, lalu simpan.
   - **Delete:** Hapus kamar yang digunakan untuk testing.
3. **Manajemen Pengguna (User Management):**
   - Buka halaman daftar pengguna.
   - Pastikan daftar admin, manager, dan user biasa tampil dengan baik.
4. **Pengaturan Sistem (Pricing & Filter Strategy):**
   - Coba ubah pengaturan harga dari *Normal* ke *Seasonal* (contoh: +20%) atau *Discount*.
   - Logout lalu login sebagai User kembali. Pastikan harga yang tampil di halaman penyewaan berubah mengikuti strategi yang Admin terapkan.

---

## 3. Catatan Tambahan (Troubleshooting)
- Jika data tidak muncul atau *error*, pastikan backend dan frontend sedang berjalan:
  - **Backend:** `php artisan serve` (di port `8000`)
  - **Frontend:** `npm run dev` (di port Vite yang aktif)
- Jika butuh mereset ulang seluruh data database menjadi posisi semula, jalankan perintah ini di dalam folder `Backend`:
  ```bash
  php artisan migrate:fresh --seed
  ```
