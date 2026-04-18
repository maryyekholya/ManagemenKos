# Dokumentasi Implementasi Pattern & Desain - ManajemenKos

## 📋 Ringkasan Struktur

Implementasi ini menggabungkan beberapa Design Pattern modern dengan karakteristik visual yang premium:

```
PDPL_ManajemenKos/
├── app/Services/
│   ├── KamarRepository.php          [SINGLETON PATTERN]
│   └── Strategies/
│       ├── PricingStrategy.php      [STRATEGY PATTERN - Pricing]
│       └── FilterStrategy.php       [STRATEGY PATTERN - Filtering]
├── app/Http/Controllers/
│   └── RoomController.php           [API Controller - Integrasi semua pattern]
└── resources/js/
    ├── Pages/
    │   └── GuestLanding.jsx         [REACT COMPONENT - UI dengan Design Pattern]
    └── Hooks/
        └── useRooms.js              [CUSTOM HOOK - Business Logic]
```

---

## 🏗️ Design Patterns yang Diimplementasikan

### 1. **SINGLETON PATTERN** - KamarRepository
**File:** `app/Services/KamarRepository.php`

**Tujuan:** Memastikan akses data kamar yang konsisten di seluruh aplikasi tanpa re-fetch yang tidak perlu.

**Implementasi:**
```php
class KamarRepository {
    private static ?self $instance = null;
    
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    // Mencegah kloning & unserialize
    private function __clone() {}
    public function __wakeup() { ... }
}
```

**Keuntungan:**
- ✅ Hanya ada 1 instance repository di memori
- ✅ Data kamar selalu konsisten
- ✅ Mengurangi beban database
- ✅ Thread-safe di PHP

**Penggunaan:**
```php
$repo = KamarRepository::getInstance();
$rooms = $repo->getAllRooms();
```

---

### 2. **STRATEGY PATTERN** - PricingStrategy
**File:** `app/Services/Strategies/PricingStrategy.php`

**Tujuan:** Memisahkan logika perhitungan harga dari UI. Admin bisa mengubah strategi harga global tanpa ubah komponen UI.

**Strategi yang Tersedia:**

| Strategi | Deskripsi | Formula |
|----------|-----------|---------|
| **NORMAL** | Harga standar tanpa adjustment | `price` |
| **SEASONAL** | Harga naik di musim ramai | `price * 1.2` |
| **DISCOUNT** | Diskon tetap Rp 100.000 | `price - 100000` |
| **PERCENTAGE_DISCOUNT** | Diskon persentase (15%) | `price * 0.85` |

**Implementasi:**
```php
interface PricingStrategy {
    public function calculatePrice(float $basePrice): float;
    public function getName(): string;
    public function getDescription(): string;
}

// Contoh implementasi
class SeasonalPricingStrategy implements PricingStrategy {
    public function calculatePrice(float $basePrice): float {
        return $basePrice * 1.2; // Naik 20%
    }
}
```

**Manager Pattern:**
```php
// Register strategi
PricingStrategyManager::register('SEASONAL', new SeasonalPricingStrategy());

// Gunakan
$displayPrice = PricingStrategyManager::calculatePrice('SEASONAL', 1500000);
```

**Keuntungan:**
- ✅ Mudah menambah strategi pricing baru
- ✅ Admin bisa mengubah harga tanpa coding
- ✅ Kompatibel dengan semua UI (tidak perlu ubah component)
- ✅ Testable dan maintainable

---

### 3. **STRATEGY PATTERN** - FilterStrategy
**File:** `app/Services/Strategies/FilterStrategy.php`

**Tujuan:** Memungkinkan penambahan filter baru tanpa merusak struktur existing.

**Filter yang Tersedia:**

| Filter | Kriteria | Contoh |
|--------|----------|--------|
| **RoomTypeFilterStrategy** | Tipe kamar (Tunggal, Double, VIP) | `type: "Double"` |
| **PriceFilterStrategy** | Harga maksimal | `price: 2000000` |
| **StatusFilterStrategy** | Status (TERSEDIA, DIPESAN) | `status: "TERSEDIA"` |
| **FeaturesFilterStrategy** | Fasilitas (WiFi, AC, KM Dalam) | `features: ["WiFi", "AC"]` |
| **CompositeFilterStrategy** | Kombinasi multiple filter | - |

**Implementasi:**
```php
interface FilterStrategy {
    public function apply(array $rooms, mixed $criteria): array;
    public function getName(): string;
}

class RoomTypeFilterStrategy implements FilterStrategy {
    public function apply(array $rooms, mixed $criteria): array {
        return array_filter($rooms, fn($room) => $room['type'] === $criteria);
    }
}
```

**Composite Filter (Multiple Filters):**
```php
$composite = new CompositeFilterStrategy();
$composite
    ->add(new RoomTypeFilterStrategy(), 'VIP')
    ->add(new PriceFilterStrategy(), 3000000)
    ->add(new FeaturesFilterStrategy(), ['WiFi', 'AC']);

$filtered = $composite->apply($rooms);
```

**Keuntungan:**
- ✅ Filter modular dan independent
- ✅ Mudah menambah filter baru (misal: lokasi, kapasitas)
- ✅ Bisa dikombinasikan (composite pattern)
- ✅ Performa tetap optimal

---

## 🎨 Karakteristik Desain Visual

### 1. **ASYMMETRY** - Dinamisme Visual
**Lokasi:** Hero section di `resources/js/Pages/GuestLanding.jsx`

```jsx
<h2 className="text-5xl md:text-6xl font-['DM_Serif_Display'] leading-[1.1] mb-6">
  Temukan <span className="italic text-[#059669]">kenyamanan</span> hunian yang tepat untuk produktivitasmu.
</h2>
```

**Elemen:**
- 📝 **Serif Display (DM_Serif_Display)** untuk judul utama → elegance
- 🔤 **Sans Serif (Plus Jakarta Sans)** untuk body text → modern & readable
- *Italic* pada kata kunci → highlight & visual interest
- 🎨 **Warna accent emerald (#059669)** → fresh & trustworthy
- ↙️ Diposisikan ke kiri (max-width-2xl) → dynamic asymmetry

**Efek Visual:**
```
┌─────────────────────┐
│ Temukan kenyamanan  │  ← Asymmetry: tidak center
│ hunian yang tepat   │
│                     │
└─────────────────────┘
```

### 2. **SPACING & PREMIUM FEEL**
**Prinsip:** Ruang putih luas = luxury & clarity

```jsx
// Padding horizontal: px-6 (24px)
// Gap antar cards: gap-8 (32px)
// Shadow: shadow-sm (halus, subtle) → hover:shadow-lg (emphasis)
<div className="px-6 pb-24 max-w-7xl mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```

**Efek:**
- ✨ Breathing room yang nyaman
- 🏢 Kesan corporate & professional
- 📱 Responsive di semua breakpoint

### 3. **STATE BADGE** - Status Visualization
**Lokasi:** Badge pada room card

```jsx
{/* [STATE VISUALIZATION] */}
<div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold 
  tracking-widest uppercase shadow-sm ${
    isAvailable 
      ? 'bg-[#d1fae5] text-[#059669]'  // Hijau: tersedia
      : 'bg-[#fef3c7] text-[#d97706]'  // Kuning: dipesan
}`}>
  {room.status}
</div>
```

**Color Semantics:**
| Status | BG Color | Text Color | Meaning |
|--------|----------|-----------|---------|
| TERSEDIA | #d1fae5 (Light Green) | #059669 (Dark Green) | ✅ Go! |
| DIPESAN | #fef3c7 (Light Yellow) | #d97706 (Dark Orange) | ⚠️ Taken |

### 4. **STATE LOGIC** - Button Interactivity
**Lokasi:** CTA button pada room card

```jsx
<button
  disabled={!isAvailable}
  className={`... ${
    isAvailable
      ? 'bg-[#059669] text-white hover:bg-[#047857] active:scale-95'
      : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'  // Disabled state
  }`}
>
  {isAvailable ? 'Pesan Sekarang' : 'Tidak Tersedia'}
</button>
```

**State Transitions:**
- ✅ **Available**: Interactive, hover effect, active scale
- ❌ **Booked**: Disabled, grayed out, cursor-not-allowed

---

## 🔌 Integration Flow

### API Endpoints

#### 1. GET `/api/rooms`
Fetch semua kamar dengan filter & pricing strategy
```
GET /api/rooms?type=VIP&pricing_strategy=SEASONAL
```
Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "Kamar C2",
      "type": "VIP",
      "price": 3500000,
      "displayPrice": 4200000,  // Dengan SEASONAL strategy
      "status": "TERSEDIA",
      "features": ["WiFi", "AC", "KM Dalam", "TV"],
      "image": "..."
    }
  ],
  "pricing_strategy": "SEASONAL"
}
```

#### 2. GET `/api/rooms/filter`
Advanced filter dengan multiple criteria
```
GET /api/rooms/filter?type=Double&max_price=2500000&features=WiFi&pricing_strategy=DISCOUNT
```

#### 3. GET `/api/pricing-strategies`
List strategi pricing yang tersedia
```json
{
  "success": true,
  "data": [
    {
      "key": "NORMAL",
      "name": "NORMAL",
      "description": "Harga normal tanpa adjustment"
    },
    {
      "key": "SEASONAL",
      "name": "SEASONAL",
      "description": "Harga naik 20% untuk musim ramai"
    }
  ]
}
```

### React Hook: `useRooms`

**Implementasi:**
```jsx
const {
  rooms,
  loading,
  error,
  currentStrategy,
  statistics,
  fetchRooms,
  filterByType,
  changePricingStrategy,
} = useRooms('NORMAL');

// Load data
useEffect(() => {
  fetchRooms();
}, [fetchRooms]);

// Filter by type
handleTypeFilter('VIP');  // Auto-fetch dengan filter baru

// Change pricing
changePricingStrategy('SEASONAL');  // Auto-refetch dengan strategy baru
```

**Statistics Computed:**
```js
{
  total: 3,
  available: 2,
  booked: 1,
  averagePrice: 2366667
}
```

---

## 🎯 Use Cases

### Scenario 1: Admin Mengaktifkan Diskon Akhir Tahun
**Without Pattern:** Harus ubah hardcoded harga di 100+ tempat  
**With Strategy Pattern:**
```php
// Backend - Hanya 1 line!
PricingStrategyManager::register('YEAR_END', new PercentageDiscountPricingStrategy(0.25));

// Frontend - Otomatis update!
changePricingStrategy('YEAR_END');
```
✅ Tidak perlu ubah database, UI, atau component!

### Scenario 2: User Mencari Kamar dengan Multiple Kriteria
**Query:** "Saya mau VIP, harga max 3 juta, ada WiFi dan AC"
```jsx
await filterRooms({
  type: 'VIP',
  max_price: 3000000,
  features: ['WiFi', 'AC']
});
```

### Scenario 3: Real-time Status Update
**Saat kamar dipesan:**
```php
// Backend: Update hanya status
$room->status = 'DIPESAN';

// Frontend: Auto-disable button & visual feedback
{isAvailable ? 'Pesan Sekarang' : 'Tidak Tersedia'}
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    GuestLanding.jsx                      │
│           (React Component dengan Tailwind CSS)          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              useRooms (Custom Hook)                      │
│    - fetchRooms()                                        │
│    - filterByType()                                      │
│    - changePricingStrategy()                             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│            RoomController (API Endpoints)                │
│    - GET /api/rooms                                      │
│    - GET /api/rooms/filter                               │
│    - GET /api/rooms/{id}                                 │
└─────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ KamarRepository │ │ PricingStrategy  │ │ FilterStrategy   │
│   [SINGLETON]   │ │   [STRATEGY]     │ │   [STRATEGY]     │
│                 │ │                  │ │                  │
│ - getInstance() │ │ - NORMAL         │ │ - RoomTypeFilter │
│ - getAllRooms() │ │ - SEASONAL       │ │ - PriceFilter    │
│ - getRoomById() │ │ - DISCOUNT       │ │ - StatusFilter   │
│ - filterByType()│ │ - PERCENTAGE...  │ │ - FeaturesFilter │
│ - filterByPrice │ │                  │ │ - CompositeFilter│
└─────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 🚀 Cara Menambahkan Fitur Baru

### Menambah Filter Baru (misal: Lokasi)
```php
// 1. Buat strategy baru
class LocationFilterStrategy implements FilterStrategy {
    public function apply(array $rooms, mixed $criteria): array {
        return array_filter($rooms, fn($room) => $room['location'] === $criteria);
    }
    public function getName(): string {
        return 'location';
    }
}

// 2. Register ke manager
FilterStrategyManager::register('location', new LocationFilterStrategy());

// 3. Gunakan di frontend
filterRooms({ location: 'Downtown' });
```

### Menambah Pricing Strategy Baru (misal: Member Discount)
```php
// 1. Implementasi strategy
class MemberDiscountPricingStrategy implements PricingStrategy {
    public function calculatePrice(float $basePrice): float {
        return $basePrice * 0.90; // Member dapat diskon 10%
    }
}

// 2. Register
PricingStrategyManager::register('MEMBER', new MemberDiscountPricingStrategy());

// 3. Gunakan
changePricingStrategy('MEMBER');
```

---

## ✅ Testing

### Unit Test untuk PricingStrategy
```php
public function testSeasonalPricing() {
    $strategy = new SeasonalPricingStrategy();
    $result = $strategy->calculatePrice(1000000);
    $this->assertEquals(1200000, $result);
}
```

### Integration Test untuk Filter
```php
public function testCompositeFilter() {
    $composite = new CompositeFilterStrategy();
    $composite->add(new RoomTypeFilterStrategy(), 'VIP')
             ->add(new PriceFilterStrategy(), 3000000);
    
    $filtered = $composite->apply($this->rooms);
    $this->assertCount(1, $filtered);
}
```

---

## 📝 Kesimpulan

✨ **Dengan implementasi ini:**
- ✅ Code yang maintainable & scalable
- ✅ Design pattern yang jelas & documented
- ✅ Visual design yang premium & professional
- ✅ Business logic yang terpisah dari UI
- ✅ Mudah menambah feature tanpa breaking changes
- ✅ Admin dapat mengubah konfigurasi tanpa coding
