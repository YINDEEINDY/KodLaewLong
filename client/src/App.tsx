import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { RootProvider } from './providers/RootProvider';
import { Navbar } from './components/Navbar';
import { AdminLayout } from './components/AdminLayout';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import { AppSelectionPage } from './pages/AppSelectionPage';
import { SummaryPage } from './pages/SummaryPage';
import { AppDetailPage } from './pages/AppDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { AdminDashboard, AdminAppsPage, AdminCategoriesPage, AdminUsersPage, AdminChangelogsPage, AdminAuditLogPage } from './pages/admin';

// Toast configuration
const toastOptions = {
  duration: 2000,
  style: {
    background: 'var(--toast-bg, #fff)',
    color: 'var(--toast-color, #1f2937)',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
};

function App() {
  return (
    <RootProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Toaster position="top-center" toastOptions={toastOptions} />
          <Navbar />
          <PWAUpdatePrompt />
          <main>
            <Routes>
              <Route path="/" element={<AppSelectionPage />} />
              <Route path="/summary" element={<SummaryPage />} />
              <Route path="/apps/:id" element={<AppDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="apps" element={<AdminAppsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="changelogs" element={<AdminChangelogsPage />} />
                <Route path="audit-logs" element={<AdminAuditLogPage />} />
              </Route>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </RootProvider>
  );
}

export default App;
