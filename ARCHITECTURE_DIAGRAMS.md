# 📊 System Architecture & Data Flow

## Complete System Diagram

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          🌐 CLIENT BROWSER                                 ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────────┐ ║
║  │                      GuestLanding.jsx                               │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────┐    │ ║
║  │  │  Hero Section                                              │    │ ║
║  │  │  ┌──────────────────────────────────────────────────────┐  │    │ ║
║  │  │  │ Temukan kenyamanan hunian yang tepat                 │  │    │ ║
║  │  │  │ (Asymmetry: Serif Display Italic + Sans Serif)      │  │    │ ║
║  │  │  └──────────────────────────────────────────────────────┘  │    │ ║
║  │  └────────────────────────────────────────────────────────────┘    │ ║
║  │                                                                      │ ║
║  │  ┌──────────────────────┐  ┌──────────────────────────────────┐   │ ║
║  │  │  Strategy Selector   │  │  Filter Bar                      │   │ ║
║  │  │  ┌────┬────┬────┐   │  │  [ALL] [Tunggal] [Double] [VIP]  │   │ ║
║  │  │  │NORM│SEAS│DISC│   │  │                                  │   │ ║
║  │  │  └────┴────┴────┘   │  │  ← setActiveType()               │   │ ║
║  │  │  ↑                   │  │                                  │   │ ║
║  │  │  └─ changePricing() │  └──────────────────────────────────┘   │ ║
║  │  └──────────────────────┘                                          │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────┐    │ ║
║  │  │  Room Grid (3 columns on desktop)                         │    │ ║
║  │  │  ┌──────────────┬──────────────┬──────────────┐           │    │ ║
║  │  │  │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │           │    │ ║
║  │  │  │ │Kamar A1  │ │ │Kamar B5  │ │ │Kamar C2  │ │           │    │ ║
║  │  │  │ │[TERSEDIA]│ │ │[DIPESAN] │ │ │[TERSEDIA]│ │           │    │ ║
║  │  │  │ │Rp 1.5M   │ │ │Rp 2.2M   │ │ │Rp 3.5M   │ │           │    │ ║
║  │  │  │ │[Pesan]   │ │ │[Disable] │ │ │[Pesan]   │ │           │    │ ║
║  │  │  │ └──────────┘ │ └──────────┘ │ └──────────┘ │           │    │ ║
║  │  │  └──────────────┴──────────────┴──────────────┘           │    │ ║
║  │  │  ↓                                                         │    │ ║
║  │  │  onClick → handleTypeFilter() / changePricingStrategy()   │    │ ║
║  │  └────────────────────────────────────────────────────────────┘    │ ║
║  │                                                                      │ ║
║  │  [useRooms Hook]                                                    │ ║
║  │  ├─ rooms: []                                                      │ ║
║  │  ├─ loading: boolean                                               │ ║
║  │  ├─ error: string | null                                           │ ║
║  │  ├─ currentStrategy: string                                        │ ║
║  │  ├─ statistics: { total, available, average }                      │ ║
║  │  ├─ fetchRooms()                                                   │ ║
║  │  ├─ filterByType(type)                                             │ ║
║  │  └─ changePricingStrategy(strategy)                                │ ║
║  └──────────────────────────────────────────────────────────────────────┘ ║
║                                                                            ║
║  HTTP/Fetch API Calls ↓ ↑ JSON Responses                                  ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
                                    ↕
╔════════════════════════════════════════════════════════════════════════════╗
║                      🖥️ SERVER (Laravel)                                   ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ┌────────────────────────────────────────────────────────────────────┐  ║
║  │  RoomController (API Endpoints)                                    │  ║
║  │                                                                    │  ║
║  │  1. getAllRooms(Request $request)                                 │  ║
║  │     ├─ GET /api/rooms                                            │  ║
║  │     └─ Query: ?type=VIP&pricing_strategy=SEASONAL                │  ║
║  │                                                                    │  ║
║  │  2. filterRooms(Request $request)                                │  ║
║  │     ├─ GET /api/rooms/filter/search                              │  ║
║  │     └─ Query: ?type=VIP&max_price=3M&features=WiFi              │  ║
║  │                                                                    │  ║
║  │  3. getRoomById(int $id, Request $request)                      │  ║
║  │     ├─ GET /api/rooms/{id}                                       │  ║
║  │     └─ Query: ?pricing_strategy=DISCOUNT                        │  ║
║  │                                                                    │  ║
║  │  4. getPricingStrategies()                                       │  ║
║  │     └─ GET /api/pricing-strategies                               │  ║
║  └────────────────────────────────────────────────────────────────────┘  ║
║                     ↓  ↑  ↓  ↑  ↓  ↑                                      ║
║  ┌──────────────────────────────────────────────────────────────────┐  ║
║  │  Service Layer                                                    │  ║
║  │                                                                   │  ║
║  │  ┌────────────────────────────────────────────────────────┐     │  ║
║  │  │ KamarRepository [SINGLETON]                           │     │  ║
║  │  │                                                        │     │  ║
║  │  │ - getInstance()                                       │     │  ║
║  │  │ - getAllRooms()                                       │     │  ║
║  │  │ - getRoomById(id)                                     │     │  ║
║  │  │ - filterByType(type)                                 │     │  ║
║  │  │ - filterByMaxPrice(price)                            │     │  ║
║  │  │                                                        │     │  ║
║  │  │ Data: [                                               │     │  ║
║  │  │   {id: 1, name: "Kamar A1", type: "Tunggal", ...},  │     │  ║
║  │  │   {id: 2, name: "Kamar B5", type: "Double", ...},   │     │  ║
║  │  │   {id: 3, name: "Kamar C2", type: "VIP", ...}       │     │  ║
║  │  │ ]                                                     │     │  ║
║  │  └────────────────────────────────────────────────────────┘     │  ║
║  │            ↓ step 1           ↓ step 2       ↓ step 3           │  ║
║  │  ┌────────────────────────────────────────────────────────┐     │  ║
║  │  │ FilterStrategyManager [STRATEGY PATTERN]             │     │  ║
║  │  │                                                        │     │  ║
║  │  │ filter(rooms, criteria):                              │     │  ║
║  │  │   - RoomTypeFilterStrategy                            │     │  ║
║  │  │   - PriceFilterStrategy                               │     │  ║
║  │  │   - StatusFilterStrategy                              │     │  ║
║  │  │   - FeaturesFilterStrategy                            │     │  ║
║  │  │   - CompositeFilterStrategy                           │     │  ║
║  │  │                                                        │     │  ║
║  │  │ If type='VIP': filter(rooms, {type: 'VIP'})          │     │  ║
║  │  │   Output: [Kamar C2]                                  │     │  ║
║  │  └────────────────────────────────────────────────────────┘     │  ║
║  │            ↓ step 2         (rooms already filtered)            │  ║
║  │  ┌────────────────────────────────────────────────────────┐     │  ║
║  │  │ PricingStrategyManager [STRATEGY PATTERN]             │     │  ║
║  │  │                                                        │     │  ║
║  │  │ calculatePrice(strategy, basePrice):                 │     │  ║
║  │  │   - NormalPricingStrategy      → price               │     │  ║
║  │  │   - SeasonalPricingStrategy    → price * 1.2         │     │  ║
║  │  │   - DiscountPricingStrategy    → price - 100k        │     │  ║
║  │  │   - PercentageDiscount...      → price * 0.85        │     │  ║
║  │  │                                                        │     │  ║
║  │  │ If strategy='SEASONAL': {displayPrice: 3.5M * 1.2}   │     │  ║
║  │  │   Output: {price: 3.5M, displayPrice: 4.2M}          │     │  ║
║  │  └────────────────────────────────────────────────────────┘     │  ║
║  │            ↓ step 3         (data enriched)                     │  ║
║  │  ┌────────────────────────────────────────────────────────┐     │  ║
║  │  │ Response Builder                                       │     │  ║
║  │  │                                                        │     │  ║
║  │  │ return {                                               │     │  ║
║  │  │   "success": true,                                    │     │  ║
║  │  │   "data": [{                                          │     │  ║
║  │  │     "id": 3,                                          │     │  ║
║  │  │     "name": "Kamar C2",                               │     │  ║
║  │  │     "type": "VIP",                                    │     │  ║
║  │  │     "price": 3500000,                                 │     │  ║
║  │  │     "displayPrice": 4200000,    ← Strategy applied   │     │  ║
║  │  │     "status": "TERSEDIA",                             │     │  ║
║  │  │     "features": [...]                                │     │  ║
║  │  │   }],                                                 │     │  ║
║  │  │   "pricing_strategy": "SEASONAL"                      │     │  ║
║  │  │ }                                                      │     │  ║
║  │  └────────────────────────────────────────────────────────┘     │  ║
║  │                                                                   │  ║
║  │  [StrategyServiceProvider - Boot]                              │  ║
║  │  ├─ Register NORMAL pricing                                    │  ║
║  │  ├─ Register SEASONAL pricing                                  │  ║
║  │  ├─ Register DISCOUNT pricing                                  │  ║
║  │  ├─ Register EARLY_BIRD pricing                                │  ║
║  │  ├─ Register YEAR_END pricing                                  │  ║
║  │  ├─ Register MEMBER pricing                                    │  ║
║  │  └─ Register PEAK_SEASON pricing                               │  ║
║  │                                                                   │  ║
║  └───────────────────────────────────────────────────────────────────┘  ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## Request/Response Flow - Step by Step

### Scenario: User filters VIP rooms with SEASONAL pricing

```
STEP 1: User clicks "VIP" filter + "SEASONAL" pricing in browser
        ↓
STEP 2: React Component calls useRooms hooks
        ├─ handleTypeFilter('VIP')
        └─ changePricingStrategy('SEASONAL')
        ↓
STEP 3: Hook makes HTTP request
        GET /api/rooms?type=VIP&pricing_strategy=SEASONAL
        ↓
STEP 4: Laravel Router → RoomController::getAllRooms()
        ↓
STEP 5: Controller gets repository instance
        $repo = KamarRepository::getInstance()
        ↓
STEP 6: Get all rooms
        $rooms = $repo->getAllRooms()
        // Returns: [Kamar A1, Kamar B5, Kamar C2]
        ↓
STEP 7: Apply FilterStrategy (type='VIP')
        $filtered = FilterStrategyManager::filter($rooms, ['type' => 'VIP'])
        // Returns: [Kamar C2] (only VIP room)
        ↓
STEP 8: Apply PricingStrategy (SEASONAL)
        foreach ($filtered as $room) {
          $room['displayPrice'] = PricingStrategyManager::calculatePrice(
            'SEASONAL',
            $room['price']
          );
          // 3500000 * 1.2 = 4200000
        }
        ↓
STEP 9: Return JSON response
        {
          "success": true,
          "data": [{
            "id": 3,
            "name": "Kamar C2",
            "type": "VIP",
            "price": 3500000,
            "displayPrice": 4200000,
            "status": "TERSEDIA",
            ...
          }],
          "count": 1,
          "pricing_strategy": "SEASONAL"
        }
        ↓
STEP 10: Frontend receives response
         setRooms([Kamar C2 with displayPrice 4.2M])
         ↓
STEP 11: React re-renders with new data
         ├─ RoomCard shows: "Rp 4.200.000/bulan"
         ├─ Badge shows: "SEASONAL"
         ├─ Status shows: "TERSEDIA"
         └─ Button enabled: "Pesan Sekarang"
         ↓
STEP 12: User sees result immediately (no page reload!)
```

---

## Pattern Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGN PATTERN LAYERS                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (React)                                     │
│  ├─ GuestLanding.jsx (UI Component)                             │
│  ├─ RoomCard.jsx (Sub-component)                                │
│  └─ useRooms.js (Custom Hook)                                  │
│                                                                  │
│  Design: Asymmetry, Premium Spacing, State Visualization        │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP (REST API)
┌──────────────────────▼──────────────────────────────────────────┐
│  API LAYER (Laravel Controller)                                 │
│  ├─ RoomController (Orchestrates everything)                    │
│  └─ Calls: Repository + Strategies                              │
│                                                                  │
│  Responsibility: Request handling, response building            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│  BUSINESS LOGIC LAYER (Services & Strategies)                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Data Access (SINGLETON PATTERN)                        │  │
│  │  KamarRepository::getInstance()                         │  │
│  │  └─ Ensures single consistent data source               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pricing Logic (STRATEGY PATTERN)                       │  │
│  │  ├─ NormalPricingStrategy                               │  │
│  │  ├─ SeasonalPricingStrategy                             │  │
│  │  ├─ DiscountPricingStrategy                             │  │
│  │  ├─ PercentageDiscountPricingStrategy                   │  │
│  │  └─ PricingStrategyManager (Coordinator)                │  │
│  │     └─ Selects & applies appropriate strategy           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Filtering Logic (STRATEGY PATTERN)                     │  │
│  │  ├─ RoomTypeFilterStrategy                              │  │
│  │  ├─ PriceFilterStrategy                                 │  │
│  │  ├─ StatusFilterStrategy                                │  │
│  │  ├─ FeaturesFilterStrategy                              │  │
│  │  ├─ CompositeFilterStrategy                             │  │
│  │  └─ FilterStrategyManager (Coordinator)                 │  │
│  │     └─ Chains filters together                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Configuration (SERVICE PROVIDER PATTERN)               │  │
│  │  StrategyServiceProvider                                │  │
│  │  └─ Registers all strategies at boot time               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│  DATA LAYER (In-Memory / Database)                              │
│  ├─ Room data with properties                                  │
│  │  └─ id, name, type, price, status, features, image        │
│  └─ (Ready to integrate with database)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Class Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SINGLETON PATTERN                            │
│                                                                  │
│   ┌─────────────────────────────────────────────────┐           │
│   │  KamarRepository                                │           │
│   ├─────────────────────────────────────────────────┤           │
│   │ - instance: KamarRepository (static)            │           │
│   │ - rooms: array                                  │           │
│   ├─────────────────────────────────────────────────┤           │
│   │ + getInstance(): KamarRepository                │           │
│   │ + getAllRooms(): array                          │           │
│   │ + getRoomById(id): ?array                       │           │
│   │ + filterByType(type): array                     │           │
│   │ + filterByMaxPrice(price): array                │           │
│   │ - __construct()                                 │           │
│   │ - __clone()                                     │           │
│   │ - __wakeup()                                    │           │
│   └─────────────────────────────────────────────────┘           │
│                                                                  │
│   Usage: $repo = KamarRepository::getInstance();                │
│   • Always returns same instance                                │
│   • Thread-safe                                                 │
│   • Prevents cloning/unserialize                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STRATEGY PATTERN (Pricing)                   │
│                                                                  │
│   ┌──────────────────────────────────────────────┐             │
│   │  <<interface>>                               │             │
│   │  PricingStrategy                             │             │
│   ├──────────────────────────────────────────────┤             │
│   │ + calculatePrice(basePrice): float           │             │
│   │ + getName(): string                          │             │
│   │ + getDescription(): string                   │             │
│   └──────────────────────────────────────────────┘             │
│           △ △ △ △ △                                            │
│           │ │ │ │ │                                            │
│   ┌───────┴─┴─┴─┴─┴────────────────────────────────┐          │
│   │                                                │          │
│   ▼ ▼ ▼ ▼ ▼                                        │          │
│   ┌──────────────────────┐  ┌─────────────────────┐ │          │
│   │NormalPricingStrategy │  │SeasonalPricing...   │ │          │
│   ├──────────────────────┤  ├─────────────────────┤ │          │
│   │+ calculatePrice()    │  │- multiplier: float  │ │          │
│   │  return basePrice    │  │+ calculatePrice()   │ │          │
│   └──────────────────────┘  │  return basePrice   │ │          │
│                             │  * multiplier       │ │          │
│                             └─────────────────────┘ │          │
│                                                      │          │
│   ┌─────────────────────────┐  ┌────────────────────┐│         │
│   │DiscountPricingStrategy │  │PercentDiscount...  ││         │
│   ├─────────────────────────┤  ├────────────────────┤│         │
│   │- discountAmount: int    │  │- discountPercentage││         │
│   │+ calculatePrice()       │  │+ calculatePrice()  ││         │
│   │  return basePrice       │  │  return basePrice  ││         │
│   │  - discountAmount       │  │  * (1 - percentage)││         │
│   └─────────────────────────┘  └────────────────────┘│         │
│                                                      │          │
│   ┌──────────────────────────────────────┐           │         │
│   │  PricingStrategyManager              │           │         │
│   │  (Static methods to manage strategy) │           │         │
│   ├──────────────────────────────────────┤           │         │
│   │+ register(key, strategy)             │           │         │
│   │+ getStrategy(key)                    │           │         │
│   │+ calculatePrice(key, price)          │           │         │
│   │+ getAllStrategies()                  │           │         │
│   └──────────────────────────────────────┘           │         │
│                                                      │          │
└──────────────────────────────────────────────────────┘          │
│                                                                  │
│  Usage:                                                         │
│  PricingStrategyManager::register('SEASONAL', new ...());      │
│  $price = PricingStrategyManager::calculatePrice('SEASONAL',    │
│    1000000); // 1200000                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STRATEGY PATTERN (Filtering)                 │
│                                                                  │
│   ┌──────────────────────────────────────────────┐             │
│   │  <<interface>>                               │             │
│   │  FilterStrategy                              │             │
│   ├──────────────────────────────────────────────┤             │
│   │ + apply(rooms, criteria): array              │             │
│   │ + getName(): string                          │             │
│   └──────────────────────────────────────────────┘             │
│           △ △ △ △ △ △                                          │
│           │ │ │ │ │ │                                          │
│  ┌────────┴─┴─┴─┴─┴─┴────────────────────────┐                │
│  │                                            │                │
│  ▼ ▼ ▼ ▼ ▼ ▼                                  │                │
│  ┌────────────────────┐  ┌──────────────────┐ │               │
│  │RoomTypeFilterStr   │  │PriceFilterStr    │ │               │
│  └────────────────────┘  └──────────────────┘ │               │
│  ┌────────────────────┐  ┌──────────────────┐ │               │
│  │StatusFilterStr     │  │FeaturesFilterStr │ │               │
│  └────────────────────┘  └──────────────────┘ │               │
│  ┌────────────────────┐                       │               │
│  │CompositeFilterStr  │ (Combines multiple)   │               │
│  │- strategies: []    │                       │               │
│  │- criteria: []      │                       │               │
│  │+ add(strategy,    │                       │               │
│  │    criteria)       │                       │               │
│  └────────────────────┘                       │               │
│                                                │                │
│  ┌────────────────────────────────────────────┤               │
│  │  FilterStrategyManager                     │               │
│  │  (Static methods to manage strategy)       │               │
│  ├────────────────────────────────────────────┤               │
│  │+ register(key, strategy)                   │               │
│  │+ getStrategy(key)                          │               │
│  │+ filter(rooms, filters)                    │               │
│  │+ getAllStrategies()                        │               │
│  └────────────────────────────────────────────┘               │
│                                                                │
│  Usage:                                                        │
│  $filtered = FilterStrategyManager::filter($rooms,             │
│    ['type' => 'VIP', 'max_price' => 3000000]);               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow for Complex Query

```
User Query: "Show me VIP rooms under 3M with WiFi, using SEASONAL pricing"

Frontend:
  filterRooms({
    type: 'VIP',
    max_price: 3000000,
    features: ['WiFi'],
    pricing_strategy: 'SEASONAL'
  })

↓ (HTTP GET request)

Backend - RoomController::filterRooms():

1. Create filter criteria:
   {
     type: 'VIP',
     max_price: 3000000,
     features: ['WiFi'],
     pricing_strategy: 'SEASONAL'
   }

2. Get all rooms:
   [
     {id: 1, name: 'Kamar A1', type: 'Tunggal', price: 1.5M, features: [WiFi, AC]},
     {id: 2, name: 'Kamar B5', type: 'Double', price: 2.2M, features: [WiFi, AC, KM]},
     {id: 3, name: 'Kamar C2', type: 'VIP', price: 3.5M, features: [WiFi, AC, KM, TV]}
   ]

3. Apply FilterStrategyManager::filter():
   
   Step 1 - RoomTypeFilterStrategy (type='VIP'):
   [
     {id: 3, name: 'Kamar C2', type: 'VIP', price: 3.5M, ...}
   ]
   
   Step 2 - PriceFilterStrategy (max_price=3M):
   []  ← Empty! (Kamar C2 is 3.5M, exceeds 3M)
   
   Step 3 - FeaturesFilterStrategy (features=['WiFi']):
   []  ← Still empty
   
   Result: []  ← No rooms match all criteria

4. Return response:
   {
     "success": true,
     "data": [],
     "count": 0,
     "filters_applied": {...}
   }

Frontend:
  Display: "Tidak ada kamar yang sesuai kriteria pencarianmu."
  (No rooms found matching your criteria)

---

Alternative Query: "Show me all VIP rooms with SEASONAL pricing"

Backend - Same flow but without price/features filters:

1. Apply FilterStrategy (type='VIP'):
   [{id: 3, name: 'Kamar C2', type: 'VIP', price: 3.5M, ...}]

2. Apply PricingStrategy (SEASONAL):
   [{id: 3, name: 'Kamar C2', type: 'VIP', price: 3.5M, 
     displayPrice: 4.2M, ...}]  ← price * 1.2

3. Return response:
   {
     "success": true,
     "data": [{...}],
     "count": 1,
     "pricing_strategy": "SEASONAL"
   }

Frontend:
  Display: Room card with "Rp 4.200.000/bulan"
```

---

This comprehensive architecture ensures:
✅ Clean separation of concerns
✅ Easy to test each layer independently
✅ Easy to add new strategies without changing existing code
✅ Scalable to add new rooms, filters, pricing options
✅ Professional & maintainable codebase
