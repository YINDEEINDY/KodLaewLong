import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { App } from '../types';
import { useSelection } from '../context/SelectionContext';
import { useFavorites } from '../context/FavoritesContext';
import { usePopularApps } from '../context/PopularAppsContext';
import { LicenseBadge, AppTypeBadge, PopularBadge, InstallGuideBadge } from './badges';

interface AppRowProps {
  app: App;
}

export function AppRow({ app }: AppRowProps) {
  const { t } = useTranslation();
  const { isSelected, toggleSelection } = useSelection();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isPopular } = usePopularApps();
  const selected = isSelected(app.id);
  const favorited = isFavorite(app.id);
  const popular = isPopular(app.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(app.id);
  };

  const handleCheckboxChange = () => {
    toggleSelection(app);
  };

  return (
    <div
      className={`group relative flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        selected
          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 dark:border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-indigo-900/20'
          : 'bg-white dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-gray-900/20'
      }`}
      onClick={handleCheckboxChange}
    >
      {/* Custom Checkbox */}
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
            selected
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 group-hover:border-indigo-400 dark:group-hover:border-indigo-500'
          }`}
        >
          {selected && (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* App Icon */}
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-1 sm:p-1.5 transition-transform duration-200 ${
          selected ? 'scale-105' : 'group-hover:scale-105'
        }`}>
          <img
            src={app.iconUrl}
            alt={app.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>';
            }}
          />
        </div>
        {selected && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5 sm:mb-1">
          <span className={`text-sm sm:text-base font-semibold transition-colors ${selected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'}`}>
            {app.name}
          </span>
          <LicenseBadge type={app.licenseType} />
          {/* Hide some badges on mobile to save space */}
          <span className="hidden sm:inline-flex"><AppTypeBadge type={app.appType} /></span>
          {popular && <span className="hidden xs:inline-flex"><PopularBadge /></span>}
          {app.hasInstallGuide && (
            <span className="hidden md:inline-flex">
              <InstallGuideBadge />
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{app.description}</p>

        {/* Manual download link */}
        {app.appType === 'MANUAL' && app.manualDownloadUrl && (
          <a
            href={app.manualDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 mt-1 sm:mt-1.5 group/link"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="group-hover/link:underline">{app.manualDownloadFileName || t('appRow.download')}</span>
          </a>
        )}
      </div>

      {/* Favorite Button - always visible on mobile when favorited */}
      <button
        onClick={handleFavoriteClick}
        className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
          favorited
            ? 'text-rose-500 dark:text-rose-400'
            : 'text-gray-300 dark:text-gray-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-400 dark:hover:text-rose-500'
        }`}
        title={favorited ? t('appRow.removeFromFavorites') : t('appRow.addToFavorites')}
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill={favorited ? 'currentColor' : 'none'}
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
      </button>

      {/* Detail Link - hidden on mobile, use tap on whole row */}
      <Link
        to={`/apps/${app.id}`}
        onClick={(e) => e.stopPropagation()}
        className="hidden sm:flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
