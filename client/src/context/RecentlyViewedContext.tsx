import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface RecentlyViewedItem {
  id: string;
  viewedAt: number;
}

interface RecentlyViewedContextType {
  recentlyViewedIds: string[];
  addToRecentlyViewed: (id: string) => void;
  clearRecentlyViewed: () => void;
  recentlyViewedCount: number;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const STORAGE_KEY = 'kodlaewlong_recently_viewed';
const MAX_ITEMS = 10;

interface RecentlyViewedProviderProps {
  children: ReactNode;
}

export function RecentlyViewedProvider({ children }: RecentlyViewedProviderProps) {
  const [recentItems, setRecentItems] = useLocalStorage<RecentlyViewedItem[]>(STORAGE_KEY, []);

  const addToRecentlyViewed = useCallback((id: string) => {
    setRecentItems((prev) => {
      // Remove existing entry for this id
      const filtered = prev.filter((item) => item.id !== id);
      // Add to the beginning
      const newItem: RecentlyViewedItem = { id, viewedAt: Date.now() };
      const updated = [newItem, ...filtered];
      // Keep only MAX_ITEMS
      return updated.slice(0, MAX_ITEMS);
    });
  }, [setRecentItems]);

  const clearRecentlyViewed = useCallback(() => {
    setRecentItems([]);
  }, [setRecentItems]);

  const value: RecentlyViewedContextType = useMemo(() => ({
    recentlyViewedIds: recentItems.map((item) => item.id),
    addToRecentlyViewed,
    clearRecentlyViewed,
    recentlyViewedCount: recentItems.length,
  }), [recentItems, addToRecentlyViewed, clearRecentlyViewed]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed(): RecentlyViewedContextType {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
