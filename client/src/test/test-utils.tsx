import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SelectionProvider } from '../context/SelectionContext';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { RecentlyViewedProvider } from '../context/RecentlyViewedContext';
import { PopularAppsProvider } from '../context/PopularAppsContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

// Wrapper with all providers
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <SelectionProvider>
            <FavoritesProvider>
              <RecentlyViewedProvider>
                <PopularAppsProvider>
                  <BrowserRouter>{children}</BrowserRouter>
                </PopularAppsProvider>
              </RecentlyViewedProvider>
            </FavoritesProvider>
          </SelectionProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

// Custom render with providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock app data for tests
export const mockApp = {
  id: 'test-app-1',
  name: 'Test App',
  description: 'A test application',
  categoryId: 'cat-1',
  categoryName: 'Test Category',
  iconUrl: 'https://example.com/icon.png',
  licenseType: 'FREE' as const,
  officialUrl: 'https://example.com',
  downloadUrl: 'https://example.com/download',
  hasInstallGuide: false,
  installGuideSteps: null,
  notes: null,
  installerUrl: null,
  installerType: 'EXE' as const,
  silentArgs: '/S',
  version: '1.0.0',
  vendor: 'Test Vendor',
  appType: 'GENERAL' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockApps = [
  mockApp,
  {
    ...mockApp,
    id: 'test-app-2',
    name: 'Another App',
    licenseType: 'PAID' as const,
  },
  {
    ...mockApp,
    id: 'test-app-3',
    name: 'Freemium App',
    licenseType: 'FREEMIUM' as const,
  },
];

export const mockCategory = {
  categoryId: 'cat-1',
  categoryName: 'Test Category',
  apps: mockApps,
};
