import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorageSet } from '../hooks/useLocalStorage';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'kodlaewlong_favorites';

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favoriteIds, actions] = useLocalStorageSet(STORAGE_KEY);

  const value: FavoritesContextType = useMemo(() => ({
    favoriteIds,
    isFavorite: actions.has,
    toggleFavorite: actions.toggle,
    addFavorite: actions.add,
    removeFavorite: actions.remove,
    clearFavorites: actions.clear,
    favoritesCount: favoriteIds.size,
  }), [favoriteIds, actions]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
