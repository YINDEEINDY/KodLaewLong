import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SelectionProvider } from './context/SelectionContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { Navbar } from './components/Navbar';
import { AdminLayout } from './components/AdminLayout';
import { AppSelectionPage } from './pages/AppSelectionPage';
import { SummaryPage } from './pages/SummaryPage';
import { AppDetailPage } from './pages/AppDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AdminDashboard, AdminAppsPage, AdminCategoriesPage, AdminUsersPage } from './pages/admin';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SelectionProvider>
          <FavoritesProvider>
            <RecentlyViewedProvider>
              <BrowserRouter>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<AppSelectionPage />} />
                      <Route path="/summary" element={<SummaryPage />} />
                      <Route path="/apps/:id" element={<AppDetailPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      {/* Admin routes */}
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="apps" element={<AdminAppsPage />} />
                        <Route path="categories" element={<AdminCategoriesPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                      </Route>
                    </Routes>
                  </main>
                </div>
              </BrowserRouter>
            </RecentlyViewedProvider>
          </FavoritesProvider>
        </SelectionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
