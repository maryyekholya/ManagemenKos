# 📱 Page Transitions Implementation Guide

## Overview
Telah diterapkan animasi transisi halaman yang smooth untuk semua perubahan view di aplikasi ManagemenKos. Setiap kali user berpindah halaman (login → home, dashboard → booking, dll), akan ada animasi transisi yang menarik.

---

## ✨ Fitur yang Diterapkan

### 1. **Main Page Transitions**
- **Lokasi**: `src/components/shared/PageTransition.tsx`
- **File yang dimodifikasi**: `src/App.tsx`
- Semua perubahan view di app sekarang memiliki animasi dengan `AnimatePresence` + `PageTransition`

### 2. **Authentication Pages Fade Animation**
- Login page: fade in/out animation
- Register page: fade in/out animation  
- Verify email page: sudah punya animasi dari sebelumnya

### 3. **5 Variasi Transisi Tersedia**

#### a) **slideInOut** (DEFAULT ⭐)
```
→ Slide dari kanan ke kiri
→ Durasi: 0.4s
→ Effect: Smooth horizontal movement
```

#### b) **fadeInOut**
```
→ Simple fade in dan fade out
→ Paling minimal dan smooth
→ Cocok untuk design yang minimalis
```

#### c) **zoomInOut**
```
→ Scale dari 0.95 hingga 1 (zoom effect)
→ Memberikan kesan "pop in"
→ Energetic dan modern
```

#### d) **rotateInOut**
```
→ Slight rotation (-5° hingga 0°)
→ Subtle dan sophisticated
→ Tidak terlalu dramatic
```

#### e) **scaleInOut**
```
→ Scale dari 0.9 hingga 1
→ Smooth grow effect
→ Elegant appearance
```

---

## 🎯 Halaman yang Memiliki Transisi

✅ **Landing Page** (Home)
✅ **Login Page** 
✅ **Register Page**
✅ **Verify Email Page**
✅ **Booking Flow**
✅ **User Dashboard**
✅ **Admin Dashboard**
✅ **Manager Dashboard**
✅ **Organizer Dashboard**
✅ **Status Checker**

Semua perubahan view menggunakan **PageTransition** dengan `AnimatePresence` mode `wait`.

---

## 🔧 Cara Mengubah Jenis Transisi

### Untuk Mengubah Variasi Global (Semua Pages)

Edit file `src/App.tsx` bagian `return` di komponen `App()`:

**Sekarang (slideInOut default):**
```jsx
<AnimatePresence mode="wait">
  <PageTransition pageKey={state.currentView}>
    {renderView()}
  </PageTransition>
</AnimatePresence>
```

**Untuk mengubah menjadi fadeInOut:**
```jsx
<AnimatePresence mode="wait">
  <PageTransition pageKey={state.currentView} variant="fadeInOut">
    {renderView()}
  </PageTransition>
</AnimatePresence>
```

### Pilihan Variant:
- `variant="slideInOut"` ← Default
- `variant="fadeInOut"`
- `variant="zoomInOut"`
- `variant="rotateInOut"`
- `variant="scaleInOut"`

---

## ⚙️ Konfigurasi Teknis

**File: `src/components/shared/PageTransition.tsx`**

### Mengubah Durasi Animasi:
```tsx
const defaultTransition = {
  type: 'tween',
  duration: 0.4,      // ← Ubah nilai ini (dalam detik)
  ease: 'easeInOut',  // Jenis easing
};
```

**Opsi durasi yang disarankan:**
- `0.2` - Very fast (snappy)
- `0.3` - Fast
- `0.4` - Normal (current) ⭐
- `0.5` - Slow
- `0.6` - Very slow (dramatic)

### Mengubah Easing Type:
```tsx
ease: 'easeInOut'  // Opsi: easeInOut, easeIn, easeOut, linear, circInOut, dll
```

---

## 🎬 Animasi Login/Register Page

Login dan Register page memiliki **fade in/out animation** yang terpisah:

```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

Ini membuat page tersebut fade in saat tampil, dan fade out saat ditutup.

---

## 🎨 Membuat Custom Animation

Jika ingin menambahkan variasi custom baru, edit `src/components/shared/PageTransition.tsx`:

```tsx
const variantAnimations = {
  customVariant: {
    initial: { opacity: 0, y: 50 },      // State awal
    in: { opacity: 1, y: 0 },            // State akhir (tampil)
    out: { opacity: 0, y: -50 },         // State keluar
  },
  // ... varian lainnya
};
```

Kemudian gunakan:
```jsx
<PageTransition pageKey={state.currentView} variant="customVariant">
  {renderView()}
</PageTransition>
```

---

## 🚀 Testing

### Development Mode:
```bash
cd Frontend
npm run dev
```

Coba navigasi antar halaman untuk melihat transisi:
1. Home → Login (seharusnya ada slide animation)
2. Login → Register (slide animation)
3. Register → Verify Email (slide animation)
4. Login → Dashboard (slide animation)
5. Dashboard → Home (slide animation)

### Production Build:
```bash
npm run build
```

✅ **Build Status**: Sukses (tested dan verified)

---

## 📦 Dependencies

Transisi ini menggunakan:
- **motion/react** (Framer Motion) - Sudah installed ✅
- Bawaan React + TypeScript

Tidak ada dependency tambahan yang diperlukan!

---

## 🔍 Advanced Features

### PageTransitionWithStagger (Untuk Child Elements)
Jika ingin animasi lebih complex dengan stagger effect untuk child elements, bisa menggunakan:

```tsx
import { PageTransitionWithStagger } from './components/shared/PageTransition';

<PageTransitionWithStagger 
  pageKey={state.currentView} 
  variant="slideInOut"
  staggerDelay={0.1}
>
  {renderView()}
</PageTransitionWithStagger>
```

---

## 📝 Notes

1. **AnimatePresence mode="wait"** memastikan animasi exit selesai sebelum animation in dimulai
2. Transisi tidak mengganggu performance aplikasi (tested di build)
3. Mobile-friendly - bekerja baik di semua device
4. Semua animasi menggunakan CSS transforms (hardware accelerated)

---

## 🎯 Quick Reference

| Variant | Best For | Duration |
|---------|----------|----------|
| **slideInOut** | General purpose | 0.4s ⭐ |
| **fadeInOut** | Minimalist design | 0.3s |
| **zoomInOut** | Modern, energetic | 0.4s |
| **rotateInOut** | Sophisticated | 0.4s |
| **scaleInOut** | Elegant | 0.4s |

---

## 📞 Troubleshooting

**Q: Animasi terasa lambat**
→ Kurangi `duration` (misalnya 0.2 atau 0.3 detik)

**Q: Animasi terasa terburu-buru**
→ Tambah `duration` (misalnya 0.5 atau 0.6 detik)

**Q: Ingin animasi yang berbeda untuk halaman tertentu**
→ Gunakan conditional variant berdasarkan `state.currentView`

**Q: Build error?**
→ Jalankan `npm install` untuk memastikan semua dependencies terinstall

---

## ✅ Status

- [x] PageTransition component created
- [x] Integrated with App.tsx
- [x] LoginPage + RegisterPage animations
- [x] Multiple variants available
- [x] Build tested and verified
- [x] Documentation complete

**Ready to use!** 🎉
