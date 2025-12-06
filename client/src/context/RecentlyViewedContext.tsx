import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

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
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load recently viewed:', e);
    }
    return [];
  });

  // Save to localStorage when recently viewed changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
    } catch (e) {
      console.error('Failed to save recently viewed:', e);
    }
  }, [recentItems]);

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
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentItems([]);
  }, []);

  const recentlyViewedIds = recentItems.map((item) => item.id);

  const value: RecentlyViewedContextType = {
    recentlyViewedIds,
    addToRecentlyViewed,
    clearRecentlyViewed,
    recentlyViewedCount: recentItems.length,
  };

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
