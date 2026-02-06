import { create } from 'zustand';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useDataStore = create((set, get) => ({
  // Courts data
  courts: {
    data: null,
    lastFetch: null,
    searchTerm: ''
  },

  // Users data
  users: {
    data: null,
    lastFetch: null,
    searchTerm: ''
  },

  // Court Prices data
  courtPrices: {
    data: null,
    lastFetch: null
  },

  // Booking Schedule data
  bookingSchedule: {
    data: null,
    lastFetch: null,
    selectedDate: null
  },

  // Cache validation
  isCacheValid: (lastFetch) => {
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_DURATION;
  },

  // Courts actions
  setCourts: (data) => set({
    courts: {
      ...get().courts,
      data,
      lastFetch: Date.now()
    }
  }),

  setCourtSearchTerm: (searchTerm) => set({
    courts: {
      ...get().courts,
      searchTerm
    }
  }),

  invalidateCourts: () => set({
    courts: {
      ...get().courts,
      lastFetch: null
    }
  }),

  // Users actions
  setUsers: (data) => set({
    users: {
      ...get().users,
      data,
      lastFetch: Date.now()
    }
  }),

  setUserSearchTerm: (searchTerm) => set({
    users: {
      ...get().users,
      searchTerm
    }
  }),

  invalidateUsers: () => set({
    users: {
      ...get().users,
      lastFetch: null
    }
  }),

  // Court Prices actions
  setCourtPrices: (data) => set({
    courtPrices: {
      data,
      lastFetch: Date.now()
    }
  }),

  updateCourtPrice: (updatedPrice) => {
    const currentData = get().courtPrices.data;
    if (!currentData) return;
    
    set({
      courtPrices: {
        data: currentData.map(p => p.id === updatedPrice.id ? updatedPrice : p),
        lastFetch: Date.now()
      }
    });
  },

  addCourtPrice: (newPrice) => {
    const currentData = get().courtPrices.data;
    if (!currentData) return;
    
    set({
      courtPrices: {
        data: [...currentData, newPrice],
        lastFetch: Date.now()
      }
    });
  },

  deleteCourtPrice: (priceId) => {
    const currentData = get().courtPrices.data;
    if (!currentData) return;
    
    set({
      courtPrices: {
        data: currentData.filter(p => p.id !== priceId),
        lastFetch: Date.now()
      }
    });
  },

  invalidateCourtPrices: () => set({
    courtPrices: {
      data: null,
      lastFetch: null
    }
  }),

  // Booking Schedule actions
  setBookingSchedule: (data, selectedDate) => set({
    bookingSchedule: {
      data,
      selectedDate,
      lastFetch: Date.now()
    }
  }),

  updateBookingInSchedule: (updatedBooking) => {
    const currentData = get().bookingSchedule.data;
    if (!currentData) return;
    
    // Update booking in the schedule data structure
    const updatedData = {
      ...currentData,
      courtTimelines: currentData.courtTimelines?.map(court => ({
        ...court,
        timeSlots: court.timeSlots?.map(slot => ({
          ...slot,
          bookings: slot.bookings?.map(booking => 
            booking.bookingDetailId === updatedBooking.bookingDetailId 
              ? { ...booking, ...updatedBooking }
              : booking
          )
        }))
      }))
    };
    
    set({
      bookingSchedule: {
        ...get().bookingSchedule,
        data: updatedData,
        lastFetch: Date.now()
      }
    });
  },

  invalidateBookingSchedule: () => set({
    bookingSchedule: {
      data: null,
      selectedDate: null,
      lastFetch: null
    }
  }),

  // Clear all cache
  clearCache: () => set({
    courts: { data: null, lastFetch: null, searchTerm: '' },
    users: { data: null, lastFetch: null, searchTerm: '' },
    courtPrices: { data: null, lastFetch: null },
    bookingSchedule: { data: null, selectedDate: null, lastFetch: null }
  })
}));

export default useDataStore;
