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

  // Clear all cache
  clearCache: () => set({
    courts: { data: null, lastFetch: null, searchTerm: '' },
    users: { data: null, lastFetch: null, searchTerm: '' }
  })
}));

export default useDataStore;
