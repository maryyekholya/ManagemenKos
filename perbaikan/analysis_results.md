# Analisa Arsitektur & Fitur Aplikasi Manajemen Kos

Setelah melakukan penelusuran mendalam pada repositori `Frontend` (React + TypeScript) dan `Backend` (Laravel), berikut adalah hasil analisa mengenai celah fitur, inefisiensi kode frontend, serta peluang penerapan Design Pattern baru.

---

## 1. Fitur yang Belum Dijalankan / Tidak Terhubung Sempurna

Walaupun aplikasi sudah memiliki alur dasar (Guest -> Register -> Booking -> Admin Verify -> Dihuni), terdapat beberapa fitur yang "terputus" secara logika maupun arsitektur:

### A. Otorisasi Spesifik & Alur Persetujuan (Approval Chain) ke Manager
- **Kondisi Saat Ini**: Role `manager` saat ini menggunakan *endpoint* milik `admin` (seperti `PUT /admin/bookings/{id}/approve`). Tidak ada perbedaan hierarki persetujuan.
- **Kekurangan Fitur**: Tidak ada alur persetujuan bertingkat (misal: "ACC dari User -> Admin -> Manager"). Jika ada diskon khusus, keluhan mayor yang butuh budget, atau pembatalan sewa sepihak, seharusnya ada request khusus ke Manager.

### B. Fitur "Perpanjang Sewa" (Rent Extension)
- **Kondisi Saat Ini**: Pada `UserDashboard.tsx` (di fungsi `handleExtendRent`), perpanjangan masa sewa **hanya disimulasikan murni di Frontend** dengan mengubah state lokal menggunakan `dispatch({ type: 'UPDATE_BOOKING', ... })` dan `dispatch({ type: 'ADD_PAYMENT', ... })`.
- **Kekurangan Fitur**: Backend sama sekali tidak mencatat perpanjangan ini. Tidak ada endpoint `POST /api/v1/bookings/{id}/extend` di backend.

---

## 2. Kode Frontend Tidak Efisien yang Harus Dipindah ke Backend

Terdapat beberapa pemrosesan berat di frontend yang seharusnya merupakan tanggung jawab backend (pemisahan *Separation of Concerns* yang buruk).

### A. Generator Kwitansi PDF (PDF Rendering)
- **Frontend Code (`PaymentReceipt` di `UserDashboard.tsx`)**: Menggunakan `html2canvas` dan `jsPDF` untuk memfoto DOM menjadi gambar lalu menjadikannya PDF.
- **Kenapa Tidak Efisien**: Render PDF di frontend rentan terhadap perbedaan resolusi layar, CSS rendering yang pecah di browser tertentu, dan file PDF yang membengkak karena format gambar.
- **Solusi**: Pindahkan ke Backend. Buat endpoint `GET /api/v1/bookings/{id}/receipt/pdf` dan gunakan package seperti `barryvdh/laravel-dompdf` di Laravel untuk men-generate file PDF asli.

### B. Kalkulasi Statistik & Ekspor CSV
- **Frontend Code (`ManagerDashboard.tsx` -> `FinancialHistory`)**: Frontend menarik **semua** data `payments` dan `bookings`, lalu menggunakan `reduce()` untuk menghitung total pendapatan, melakukan filter rentang waktu, dan mem-parsing text manual menggunakan `Blob` untuk menjadi file CSV.
- **Kenapa Tidak Efisien**: Jika data mencapai puluhan ribu transaksi, browser akan freeze (memori penuh).
- **Solusi**: Pindahkan logika agregasi ke Backend. Buat endpoint `GET /api/v1/manager/reports/financial?month=...&year=...` yang mengeksekusi *SQL aggregation* (`SUM()`, `GROUP BY`), dan endpoint khusus `GET /api/v1/manager/reports/export-csv` untuk download file.

### C. Simulasi Bayar QRIS & Verifikasi
- **Frontend Code**: Pada klaim QRIS, jika endpoint sukses, Frontend langsung meng-inject notifikasi buatan ke admin.
- **Solusi**: Backend harus yang memancarkan (*emit*) notifikasi secara otomatis ketika endpoint pembayaran berhasil dipanggil, bukan dikendalikan dari frontend.

---

## 3. Implementasi Design Pattern Baru (Yang Belum Ada)

Berdasarkan *folder* `app/Services/Patterns` di backend, Anda sudah memiliki: `Adapter`, `Decorator`, `Facade`, `Factory`, `Observer`, `Singleton`, `State`, dan `Strategy`.

Berikut adalah **Design Pattern tambahan** yang ideal untuk menyelesaikan fitur-fitur yang hilang di atas:

### A. Chain of Responsibility Pattern
**Gunakan Untuk**: Menyelesaikan masalah **Approval Manager & Admin**.
**Cara Kerja**: 
Ketika user meminta hal yang butuh persetujuan (seperti diskon, refund, atau keluhan berat), request akan melewati "Rantai".
1. `AdminHandler`: Menerima request, jika request standar (misal: perpanjang normal), langsung otomatis ACC. Jika request kompleks (misal: minta pembatalan uang kembali), AdminHandler meneruskan (passthrough) ke Manager.
2. `ManagerHandler`: Mengambil alur persetujuan akhir.
**Implementasi di Laravel**: Dibuat sebagai serangkaian class yang saling memanggil `next($request)`.

### B. Builder Pattern
**Gunakan Untuk**: Menyelesaikan masalah **Kalkulasi Laporan Kompleks** yang dipindah dari frontend.
**Cara Kerja**: 
Membangun query laporan keuangan secara bertahap tanpa membuat *method* atau parameter yang sangat panjang.
```php
$report = (new FinancialReportBuilder())
    ->setMonth($request->month)
    ->setYear($request->year)
    ->filterByRoomType('VIP')
    ->includeTaxes()
    ->build();
```

### C. Command Pattern
**Gunakan Untuk**: Mengatur semua jenis tindakan pemesanan (*Extend*, *Cancel*, *Approve*).
**Cara Kerja**:
Alih-alih menulis semua logika di Controller, bungkus tiap aksi sebagai objek `Command`. Ini mempermudah pencatatan *Audit Trail* (Siapa melakukan apa dan kapan).
Misal: `ExecuteExtendBookingCommand`, `ExecuteEvictTenantCommand`.

---

## Rangkuman Saran Tindakan (Next Steps)

1. **Refactor Frontend**: Hapus fungsi *mocking* `html2canvas` dan ekstensi sewa palsu di React.
2. **Buat Controller Laporan**: Buat `ReportController` menggunakan **Builder Pattern** untuk dieksekusi di backend.
3. **Buat Approval Chain**: Implementasi **Chain of Responsibility** untuk request pembatalan / pengajuan ke Manager.
