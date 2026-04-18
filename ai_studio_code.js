// [SINGLETON] KamarRepository - Satu pintu akses data kamar
class KamarRepository {
  static instance;
  constructor() {
    this.rooms = [
      { id: 1, name: "Kamar A1", type: "Tunggal", price: 1500000, status: "TERSEDIA", features: ["WiFi", "AC"], image: "https://images.unsplash.com/photo-1522771739844-649f6d175d97?auto=format&fit=crop&q=80&w=800" },
      { id: 2, name: "Kamar B5", type: "Double", price: 2200000, status: "DIPESAN", features: ["WiFi", "AC", "KM Dalam"], image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800" },
      { id: 3, name: "Kamar C2", type: "VIP", price: 3500000, status: "TERSEDIA", features: ["WiFi", "AC", "KM Dalam", "TV"], image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800" },
    ];
  }

  static getInstance() {
    if (!this.instance) this.instance = new KamarRepository();
    return this.instance;
  }

  getAllRooms() { return this.rooms; }
}

// [STRATEGY: PricingStrategy] - Penyesuaian harga tanpa ubah UI
const PricingStrategies = {
  NORMAL: (price) => price,
  SEASONAL: (price) => price * 1.2, // Naik 20%
  DISCOUNT: (price) => price - 100000 // Potongan tetap
};

// [STRATEGY: FilterStrategy] - Logika filter modular
const FilterStrategies = {
  BY_TYPE: (rooms, type) => type === "ALL" ? rooms : rooms.filter(r => r.type === type),
  BY_PRICE: (rooms, max) => rooms.filter(r => r.price <= max)
};