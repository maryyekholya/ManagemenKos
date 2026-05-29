/**
 * [CUSTOM HOOK]
 * useRooms: Hook untuk mengelola data kamar dengan berbagai strategi
 * Memisahkan logika fetching dari komponen UI
 */
import { useState, useCallback, useMemo } from 'react';

const useRooms = (initialPricingStrategy = 'NORMAL') => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStrategy, setCurrentStrategy] = useState(initialPricingStrategy);
  const [activeFilters, setActiveFilters] = useState({});

  /**
   * Fetch semua kamar dari API
   */
  const fetchRooms = useCallback(async (filters = {}, strategy = currentStrategy) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        pricing_strategy: strategy,
        ...filters,
      });

      const response = await fetch(`/api/rooms?${params}`);
      if (!response.ok) throw new Error('Gagal fetch data kamar');

      const data = await response.json();
      setRooms(data.data || []);
      setActiveFilters(filters);
      setCurrentStrategy(strategy);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  }, [currentStrategy]);

  /**
   * Filter kamar dengan multiple kriteria
   */
  const filterRooms = useCallback(async (criteria = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        pricing_strategy: currentStrategy,
        ...criteria,
      });

      const response = await fetch(`/api/rooms/filter?${params}`);
      if (!response.ok) throw new Error('Gagal filter kamar');

      const data = await response.json();
      setRooms(data.data || []);
      setActiveFilters(criteria);
    } catch (err) {
      setError(err.message);
      console.error('Error filtering rooms:', err);
    } finally {
      setLoading(false);
    }
  }, [currentStrategy]);

  /**
   * Ubah pricing strategy
   */
  const changePricingStrategy = useCallback((strategy) => {
    setCurrentStrategy(strategy);
    // Re-fetch dengan strategy baru
    fetchRooms(activeFilters, strategy);
  }, [fetchRooms, activeFilters]);

  /**
   * Filter berdasarkan tipe
   */
  const filterByType = useCallback((type) => {
    const newFilters = { ...activeFilters, type: type === 'ALL' ? undefined : type };
    filterRooms(newFilters);
  }, [filterRooms, activeFilters]);

  /**
   * Filter berdasarkan harga maksimal
   */
  const filterByMaxPrice = useCallback((maxPrice) => {
    const newFilters = { ...activeFilters, max_price: maxPrice };
    filterRooms(newFilters);
  }, [filterRooms, activeFilters]);

  /**
   * Hitung statistik kamar
   */
  const statistics = useMemo(() => ({
    total: rooms.length,
    available: rooms.filter(r => r.status === 'TERSEDIA').length,
    booked: rooms.filter(r => r.status === 'DIPESAN').length,
    averagePrice: rooms.length > 0
      ? Math.round(rooms.reduce((sum, r) => sum + r.displayPrice, 0) / rooms.length)
      : 0,
  }), [rooms]);

  return {
    rooms,
    loading,
    error,
    currentStrategy,
    activeFilters,
    statistics,
    fetchRooms,
    filterRooms,
    filterByType,
    filterByMaxPrice,
    changePricingStrategy,
  };
};

export default useRooms;
