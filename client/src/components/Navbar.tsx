import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelection } from '../context/SelectionContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { AppType } from '../types';

interface Tab {
  type: AppType;
  labelKey: string;
  icon: string;
}

const TABS: Tab[] = [
  { type: 'GENERAL', labelKey: 'nav.general', icon: '🚀' },
  { type: 'ENTERPRISE', labelKey: 'nav.enterprise', icon: '🏢' },
  { type: 'MANUAL', labelKey: 'nav.manual', icon: '🔧' },
];

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { selectionCount } = useSelection();
  const { user, signOut, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const currentType = (searchParams.get('type') as AppType) || 'GENERAL';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'th' ? 'en' : 'th';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 group-hover:shadow-indigo-300 dark:group-hover:shadow-indigo-800/40 transition-shadow">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              KodLaewLong
            </span>
          </Link>

          {/* Center: Tab Navigation (Desktop) */}
          <div className="hidden lg:flex items-center bg-gray-100/80 dark:bg-gray-800/80 rounded-xl p-1">
            {TABS.map((tab) => (
              <Link
                key={tab.type}
                to={`/?type=${tab.type}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentType === tab.type
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {t(tab.labelKey)}
              </Link>
            ))}
          </div>

          {/* Right: Desktop actions */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              aria-label="Toggle language"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span>{i18n.language === 'th' ? 'TH' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Summary Link */}
            <Link
              to="/summary"
              className="relative flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="hidden md:inline text-sm font-medium">{t('summary.title')}</span>
              {selectionCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {selectionCount}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Auth Section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Admin link */}
                {user.user_metadata?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 px-3 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-indigo-300 dark:hover:shadow-indigo-800/40 font-medium"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Summary + Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Summary Link (Mobile) */}
            <Link
              to="/summary"
              className="relative p-2 text-gray-600 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {selectionCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {selectionCount}
                </span>
              )}
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden flex items-center justify-center gap-1 pb-2 -mt-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <Link
              key={tab.type}
              to={`/?type=${tab.type}`}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                currentType === tab.type
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              {t(tab.labelKey)}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-3">
            {/* Theme & Language Row */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {i18n.language === 'th' ? 'TH' : 'EN'}
              </button>
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800"
              >
                {isDark ? (
                  <>
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t('theme.light')}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t('theme.dark')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Auth Section */}
            {loading ? (
              <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="space-y-2">
                {/* User info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.user_metadata?.role === 'admin' ? 'Admin' : 'User'}
                    </p>
                  </div>
                </div>

                {/* Admin link */}
                {user.user_metadata?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 w-full p-3 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-xl font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('admin.dashboard')}
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full p-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
