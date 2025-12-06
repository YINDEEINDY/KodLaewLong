import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchPopularAppIds } from '../api/statsApi';

interface PopularAppsContextType {
  popularAppIds: Set<string>;
  isPopular: (appId: string) => boolean;
  loading: boolean;
}

const PopularAppsContext = createContext<PopularAppsContextType | undefined>(undefined);

export function PopularAppsProvider({ children }: { children: ReactNode }) {
  const [popularAppIds, setPopularAppIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularApps() {
      try {
        const { appIds } = await fetchPopularAppIds(3); // threshold of 3 selections
        setPopularAppIds(new Set(appIds));
      } catch (error) {
        console.error('Failed to fetch popular apps:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularApps();

    // Refresh every 5 minutes
    const interval = setInterval(fetchPopularApps, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isPopular = (appId: string) => popularAppIds.has(appId);

  return (
    <PopularAppsContext.Provider value={{ popularAppIds, isPopular, loading }}>
      {children}
    </PopularAppsContext.Provider>
  );
}

export function usePopularApps() {
  const context = useContext(PopularAppsContext);
  if (!context) {
    throw new Error('usePopularApps must be used within PopularAppsProvider');
  }
  return context;
}
