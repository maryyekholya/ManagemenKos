# 🚀 Quick Start - Page Transitions

## Sudah Diterapkan ✅

Transisi halaman sudah **otomatis berfungsi** untuk semua page changes di aplikasi. Tidak perlu setup tambahan!

### Coba Sekarang:

```bash
cd Frontend
npm run dev
```

Kemudian navigasi antar halaman:
- Home → Login (animasi slide)
- Login → Register (animasi slide)
- Register → Home (animasi slide)
- Dashboard → Home (animasi slide)

---

## 🎨 Mengubah Tipe Animasi (3 Langkah)

### Step 1: Buka file `Frontend/src/App.tsx`

### Step 2: Cari bagian ini (sekitar line 275):
```jsx
<AnimatePresence mode="wait">
  <PageTransition pageKey={state.currentView}>
    {renderView()}
  </PageTransition>
</AnimatePresence>
```

### Step 3: Tambahkan `variant` prop:
```jsx
<AnimatePresence mode="wait">
  <PageTransition pageKey={state.currentView} variant="fadeInOut">
    {renderView()}
  </PageTransition>
</AnimatePresence>
```

---

## 🎬 Pilihan Animasi

| Variant | Deskripsi | Cocok Untuk |
|---------|-----------|------------|
| `slideInOut` | Slide dari kanan (DEFAULT) | Umum, modern |
| `fadeInOut` | Simple fade in/out | Minimalis, elegant |
| `zoomInOut` | Zoom scale effect | Modern, energetic |
| `rotateInOut` | Subtle rotation | Sophisticated |
| `scaleInOut` | Grow effect | Elegant |

---

## ⚡ Mempercepat/Memperlambat Animasi

### Buka: `Frontend/src/components/shared/PageTransition.tsx`

### Cari:
```tsx
const defaultTransition = {
  type: 'tween',
  duration: 0.4,    // ← Ubah angka ini
  ease: 'easeInOut',
};
```

**Opsi:**
- `0.2` = Sangat cepat
- `0.3` = Cepat
- `0.4` = Normal (sekarang) ⭐
- `0.5` = Slow
- `0.6` = Sangat slow

---

## 📝 File yang Dimodifikasi

1. ✅ `Frontend/src/components/shared/PageTransition.tsx` (BARU)
   - Komponen transisi dengan 5 variasi animasi

2. ✅ `Frontend/src/App.tsx` (DIUBAH)
   - Menambahkan PageTransition wrapper
   - Fade animation untuk LoginPage & RegisterPage

3. ✅ `Frontend/PAGE_TRANSITIONS_GUIDE.md` (BARU)
   - Dokumentasi lengkap

---

## 🎯 Animasi per Halaman

| Halaman | Animasi |
|---------|---------|
| Login | Fade + Slide |
| Register | Fade + Slide |
| Home | Slide |
| User Dashboard | Slide |
| Admin Dashboard | Slide |
| Booking Flow | Slide |
| Manager Dashboard | Slide |
| Organizer Dashboard | Slide |

---

## 💡 Pro Tips

### Kombinasi terbaik:
- **Modern app** → `zoomInOut` dengan duration `0.4s`
- **Minimalis app** → `fadeInOut` dengan duration `0.3s`
- **Professional app** → `slideInOut` dengan duration `0.4s` (current)

### Testing:
Jalankan `npm run build` untuk memastikan tidak ada error sebelum production.

---

## 🐛 Jika Ada Masalah

**Q: Animasi tidak muncul?**
```
Pastikan:
- npm run dev berjalan
- Tidak ada error di console
- PageTransition import sudah benar
```

**Q: Mau reset ke animasi awal?**
```
Gunakan variant="slideInOut" atau hapus variant prop
```

**Q: Mau animasi yang lebih unik?**
```
Lihat FILE: TRANSITIONS_EXAMPLES.tsx
Contoh custom animation tersedia di sana
```

---

## ✨ Build Status

✅ **npm run build** - Sukses tanpa error
✅ **npm run dev** - Ready to test
✅ **Semua halaman** - Transisi berfungsi

**Siap digunakan di production!** 🎉

---

## 📚 Dokumentasi Lengkap

Untuk detail lebih lanjut, buka:
- `PAGE_TRANSITIONS_GUIDE.md` - Panduan komprehensif
- `TRANSITIONS_EXAMPLES.tsx` - 10+ contoh implementasi

Enjoy smooth transitions! 🚀
