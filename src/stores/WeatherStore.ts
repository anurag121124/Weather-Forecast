import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPreferencesStore {
  unit: "metric" | "imperial";
  favoriteLocations: string[];
  setUnit: (unit: "metric" | "imperial") => void;
  addFavoriteLocation: (location: string) => void;
  removeFavoriteLocation: (location: string) => void;
  isFavorite: (location: string) => boolean;
}

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      unit: "metric",
      favoriteLocations: [],
      setUnit: (unit) => set({ unit }),
      addFavoriteLocation: (location) =>
        set((state) => ({
          favoriteLocations: Array.from(new Set([...state.favoriteLocations, location])),
        })),
      removeFavoriteLocation: (location) =>
        set((state) => ({
          favoriteLocations: state.favoriteLocations.filter((fav) => fav !== location),
        })),
      isFavorite: (location) => get().favoriteLocations.includes(location),
    }),
    { name: "user-preferences" }
  )
);
