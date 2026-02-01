import { create } from 'zustand';

const useDataStore = create((set, get) => ({
  // User Management Cache
  users: {
    data: null,
    stats: null,
    lastFetch: null,
    filters: {
      keyword: '',
      roleName: '',
      sortBy: 'id',
      sortDir: 'asc'
    },
    page: 0
  },

  // Court Management Cache
  courts: {
    data: null,
    lastFetch: null,
    searchTerm: '',
  },

  // Cache expiry time (5 minutes)
  CACHE_DURATION: 5 * 60 * 1000,

  // Check if cache is valid
  isCacheValid: (lastFetch) => {
    if (!lastFetch) return false;
    const now = Date.now();
    return (now - lastFetch) < get().CACHE_DURATION;
  },

  // User Management Actions
  setUsers: (data, stats = null) => set((state) => ({
    users: {
      ...state.users,
      data,
      stats: stats || state.users.stats,
      lastFetch: Date.now()
    }
  })),

  setUserStats: (stats) => set((state) => ({
    users: {
      ...state.users,
      stats,
      lastFetch: Date.now()
    }
  })),

  setUserFilters: (filters) => set((state) => ({
    users: {
      ...state.users,
      filters: { ...state.users.filters, ...filters }
    }
  })),

  setUserPage: (page) => set((state) => ({
    users: {
      ...state.users,
      page
    }
  })),

  invalidateUsers: () => set((state) => ({
    users: {
      ...state.users,
      lastFetch: null
    }
  })),

  // Court Management Actions
  setCourts: (data) => set((state) => ({
    courts: {
      ...state.courts,
      data,
      lastFetch: Date.now()
    }
  })),

  setCourtSearchTerm: (searchTerm) => set((state) => ({
    courts: {
      ...state.courts,
      searchTerm
    }
  })),

  invalidateCourts: () => set((state) => ({
    courts: {
      ...state.courts,
      lastFetch: null
    }
  })),

  // Clear all cache
  clearCache: () => set({
    users: {
      data: null,
      stats: null,
      lastFetch: null,
      filters: {
        keyword: '',
        roleName: '',
        sortBy: 'id',
        sortDir: 'asc'
      },
      page: 0
    },
    courts: {
      data: null,
      lastFetch: null,
      searchTerm: '',
    }
  })
}));

export default useDataStore;
