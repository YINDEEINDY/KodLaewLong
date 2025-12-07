import type { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { SelectionProvider } from '../context/SelectionContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { RecentlyViewedProvider } from '../context/RecentlyViewedContext';
import { PopularAppsProvider } from '../context/PopularAppsContext';

interface RootProviderProps {
  children: ReactNode;
}

/**
 * RootProvider - Combines all app providers in the correct order
 *
 * Provider order matters:
 * 1. ThemeProvider - UI theming (no dependencies)
 * 2. AuthProvider - Authentication state (no dependencies)
 * 3. SelectionProvider - Depends on AuthProvider for user-specific selections
 * 4. FavoritesProvider - Local storage based (no dependencies)
 * 5. RecentlyViewedProvider - Local storage based (no dependencies)
 * 6. PopularAppsProvider - Fetches from API (no dependencies)
 */
export function RootProvider({ children }: RootProviderProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SelectionProvider>
          <FavoritesProvider>
            <RecentlyViewedProvider>
              <PopularAppsProvider>
                {children}
              </PopularAppsProvider>
            </RecentlyViewedProvider>
          </FavoritesProvider>
        </SelectionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
