import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WeatherData } from '@/types/weather'

interface WeatherStore {
  // State
  unit: 'metric' | 'imperial'
  favorites: string[]
  currentWeather: WeatherData | null
  recentSearches: string[]
  
  // Actions
  setUnit: (unit: 'metric' | 'imperial') => void
  addFavorite: (location: string) => void
  removeFavorite: (location: string) => void
  setCurrentWeather: (weather: WeatherData) => void
  addRecentSearch: (location: string) => void
  clearRecentSearches: () => void
  
  // Computed
  isFavorite: (location: string) => boolean
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      // Initial state
      unit: 'metric',
      favorites: [],
      currentWeather: null,
      recentSearches: [],

      // Actions
      setUnit: (unit) => set({ unit }),

      addFavorite: (location) => 
        set((state) => ({
          favorites: Array.from(new Set([...state.favorites, location]))
        })),

      removeFavorite: (location) =>
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav !== location)
        })),

      setCurrentWeather: (weather) =>
        set({ currentWeather: weather }),

      addRecentSearch: (location) =>
        set((state) => {
          const maxRecentSearches = 5
          const filtered = state.recentSearches.filter((s) => s !== location)
          return {
            recentSearches: [location, ...filtered].slice(0, maxRecentSearches)
          }
        }),

      clearRecentSearches: () =>
        set({ recentSearches: [] }),

      // Computed values
      isFavorite: (location) => {
        const state = get()
        return state.favorites.includes(location)
      },
    }),
    {
      name: 'weather-store',
      partialize: (state) => ({
        unit: state.unit,
        favorites: state.favorites,
        recentSearches: state.recentSearches,
      }),
    }
  )
)