import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { AppType, CategoryWithApps, LicenseType, App } from '../types';
import { getApps } from '../api/appsApi';
import { AppGrid } from '../components/AppGrid';
import { BottomBar } from '../components/BottomBar';
import { useSelection } from '../context/SelectionContext';
import { useFavorites } from '../context/FavoritesContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

const LICENSE_OPTIONS: { value: LicenseType | 'ALL'; labelKey: string; color: string }[] = [
  { value: 'ALL', labelKey: 'appSelection.license.all', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  { value: 'FREE', labelKey: 'appSelection.license.free', color: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' },
  { value: 'FREEMIUM', labelKey: 'appSelection.license.freemium', color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' },
  { value: 'TRIAL', labelKey: 'appSelection.license.trial', color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400' },
  { value: 'PAID', labelKey: 'appSelection.license.paid', color: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400' },
];

const TYPE_CONFIG: Record<AppType, {
  titleKey: string;
  subtitleKey: string;
  icon: string;
  gradient: string;
}> = {
  GENERAL: {
    titleKey: 'appSelection.title.general',
    subtitleKey: 'appSelection.subtitle.general',
    icon: '🚀',
    gradient: 'from-indigo-500 to-purple-600',
  },
  ENTERPRISE: {
    titleKey: 'appSelection.title.enterprise',
    subtitleKey: 'appSelection.subtitle.enterprise',
    icon: '🏢',
    gradient: 'from-blue-500 to-cyan-600',
  },
  MANUAL: {
    titleKey: 'appSelection.title.manual',
    subtitleKey: 'appSelection.subtitle.manual',
    icon: '🔧',
    gradient: 'from-orange-500 to-red-500',
  },
};

export function AppSelectionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const appType = (searchParams.get('type') as AppType) || 'GENERAL';
  const { selectionCount } = useSelection();
  const { favoriteIds, favoritesCount } = useFavorites();
  const { recentlyViewedIds, clearRecentlyViewed } = useRecentlyViewed();

  const [categories, setCategories] = useState<CategoryWithApps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [licenseFilter, setLicenseFilter] = useState<LicenseType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(true);

  const fetchApps = async (type: AppType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getApps(type);
      setCategories(response.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps(appType);
  }, [appType]);

  // Get unique category names for filter
  const categoryOptions = useMemo(() => {
    return [{ value: 'ALL', label: t('appSelection.filter.allCategories') }, ...categories.map(cat => ({ value: cat.slug, label: cat.name }))];
  }, [categories, t]);

  // Filter categories and apps based on search, license, category, and favorites
  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return categories
      .filter(cat => categoryFilter === 'ALL' || cat.slug === categoryFilter)
      .map(cat => ({
        ...cat,
        apps: cat.apps.filter(app => {
          // Favorites filter
          if (showFavoritesOnly && !favoriteIds.has(app.id)) {
            return false;
          }

          // Search filter
          const matchesSearch = !query ||
            app.name.toLowerCase().includes(query) ||
            app.description.toLowerCase().includes(query);

          // License filter
          const matchesLicense = licenseFilter === 'ALL' || app.licenseType === licenseFilter;

          return matchesSearch && matchesLicense;
        })
      }))
      .filter(cat => cat.apps.length > 0);
  }, [categories, searchQuery, licenseFilter, categoryFilter, showFavoritesOnly, favoriteIds]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || licenseFilter !== 'ALL' || categoryFilter !== 'ALL' || showFavoritesOnly;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setLicenseFilter('ALL');
    setCategoryFilter('ALL');
    setShowFavoritesOnly(false);
  };

  const totalApps = categories.reduce((sum, cat) => sum + cat.apps.length, 0);
  const config = TYPE_CONFIG[appType];

  // Get recently viewed apps
  const recentlyViewedApps = useMemo(() => {
    if (recentlyViewedIds.length === 0) return [];

    const allApps = categories.flatMap(cat => cat.apps);
    return recentlyViewedIds
      .map(id => allApps.find(app => app.id === id))
      .filter((app): app is App => app !== undefined)
      .slice(0, 5);
  }, [categories, recentlyViewedIds]);

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-gray-900">
        {/* Hero Skeleton */}
        <div className={`bg-gradient-to-r ${config.gradient} text-white`}>
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="h-10 bg-white/20 rounded-lg w-64 mb-4 skeleton"></div>
            <div className="h-6 bg-white/20 rounded-lg w-96 skeleton"></div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 skeleton"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded skeleton"></div>
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg skeleton"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2 skeleton"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full skeleton"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="card text-center py-12 max-w-md mx-4">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('common.error')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={() => fetchApps(appType)} className="btn-primary">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 dark:bg-gray-900">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${config.gradient} text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{config.icon}</span>
                <h1 className="text-3xl md:text-4xl font-bold">{t(config.titleKey)}</h1>
              </div>
              <p className="text-white/80 text-lg max-w-xl">{t(config.subtitleKey)}</p>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalApps}</p>
                    <p className="text-xs text-white/70">{t('appSelection.stats.totalApps')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectionCount}</p>
                    <p className="text-xs text-white/70">{t('appSelection.stats.selected')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <div className="w-full md:w-96">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t('appSelection.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-search shadow-lg text-gray-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[88px] sm:top-[104px] lg:top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col gap-2 sm:gap-4">
            {/* Row 1: Favorites + Category + Clear */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Favorites Toggle */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                disabled={favoritesCount === 0}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all flex-shrink-0 ${
                  showFavoritesOnly
                    ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 ring-2 ring-offset-1 ring-rose-400'
                    : favoritesCount > 0
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                title={favoritesCount === 0 ? t('appSelection.filter.noFavorites') : t('appSelection.filter.favorites')}
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill={showFavoritesOnly ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="hidden xs:inline">{t('appSelection.filter.favorites')}</span>
                {favoritesCount > 0 && (
                  <span className={`px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs rounded-full ${
                    showFavoritesOnly
                      ? 'bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {favoritesCount}
                  </span>
                )}
              </button>

              <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:inline">{t('appSelection.filter.category')}:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">{t('appSelection.filter.clearFilters')}</span>
                </button>
              )}
            </div>

            {/* Row 2: License Filter - horizontal scroll on mobile */}
            <div className="flex items-center gap-2 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto scrollbar-hide">
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap flex-shrink-0">{t('appSelection.filter.type')}:</span>
              <div className="flex gap-1.5 sm:gap-2">
                {LICENSE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLicenseFilter(option.value)}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                      licenseFilter === option.value
                        ? `${option.color} ring-2 ring-offset-1 ring-current`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Recently Viewed Section */}
        {recentlyViewedApps.length > 0 && showRecentlyViewed && !hasActiveFilters && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('appSelection.recentlyViewed.title')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearRecentlyViewed}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  {t('appSelection.recentlyViewed.clearHistory')}
                </button>
                <button
                  onClick={() => setShowRecentlyViewed(false)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {recentlyViewedApps.map((app) => (
                <Link
                  key={app.id}
                  to={`/apps/${app.id}`}
                  className="flex-shrink-0 flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
                >
                  <img
                    src={app.iconUrl}
                    alt={app.name}
                    className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-700 p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {app.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                      {app.description.slice(0, 30)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filter Results Info */}
        {hasActiveFilters && (
          <div className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>
              {t('appSelection.results.found')} <strong className="text-gray-900 dark:text-gray-100">{filteredCategories.reduce((sum, cat) => sum + cat.apps.length, 0)}</strong> {t('appSelection.results.apps')}
              {searchQuery && <> {t('appSelection.results.searching')} "<strong className="text-gray-900 dark:text-gray-100">{searchQuery}</strong>"</>}
              {licenseFilter !== 'ALL' && <> {t('appSelection.results.inType')} <strong className="text-gray-900 dark:text-gray-100">{t(LICENSE_OPTIONS.find(o => o.value === licenseFilter)?.labelKey || '')}</strong></>}
              {categoryFilter !== 'ALL' && <> {t('appSelection.results.inCategory')} <strong className="text-gray-900 dark:text-gray-100">{categoryOptions.find(o => o.value === categoryFilter)?.label}</strong></>}
            </span>
          </div>
        )}

        {/* Empty state */}
        {filteredCategories.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('appSelection.empty.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {hasActiveFilters
                ? t('appSelection.empty.filterMessage')
                : t('appSelection.empty.noApps')
              }
            </p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="btn-secondary">
                {t('common.clearAll')}
              </button>
            )}
          </div>
        )}

        {/* App Grid */}
        {filteredCategories.length > 0 && (
          <AppGrid categories={filteredCategories} />
        )}
      </div>

      {/* Bottom Bar */}
      <BottomBar />
    </div>
  );
}
