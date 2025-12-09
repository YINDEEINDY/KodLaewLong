import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, session, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: t('admin.dashboard'), icon: '📊' },
    { path: '/admin/apps', label: t('admin.apps'), icon: '📱' },
    { path: '/admin/categories', label: t('admin.categories'), icon: '📁' },
    { path: '/admin/changelogs', label: t('admin.changelogs'), icon: '📝' },
    { path: '/admin/users', label: t('admin.users'), icon: '👥' },
    { path: '/admin/audit-logs', label: t('admin.auditLogs'), icon: '📋' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin';

  if (!session || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 dark:bg-gray-950 text-white flex flex-col">
        <div className="p-4 flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('admin.title')}</h2>
              <p className="text-xs text-gray-400">{t('admin.subtitle')}</p>
            </div>
          </div>

          <nav className="space-y-1" aria-label="Admin navigation">
            {navItems.map((item) => {
              const isActive = item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-xl" aria-hidden="true">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label={isDark ? t('admin.lightMode') : t('admin.darkMode')}
          >
            {isDark ? (
              <>
                <span className="text-xl" aria-hidden="true">☀️</span>
                <span className="font-medium">{t('admin.lightMode')}</span>
              </>
            ) : (
              <>
                <span className="text-xl" aria-hidden="true">🌙</span>
                <span className="font-medium">{t('admin.darkMode')}</span>
              </>
            )}
          </button>

          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">📖</span>
            <span className="font-medium">{t('admin.apiDocs')}</span>
            <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">🏠</span>
            <span className="font-medium">{t('admin.backToSite')}</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
