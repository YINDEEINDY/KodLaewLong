import { Link } from 'react-router-dom';
import type { App, AppType } from '../types';
import { useSelection } from '../context/SelectionContext';
import { useFavorites } from '../context/FavoritesContext';

interface AppRowProps {
  app: App;
}

function LicenseBadge({ type }: { type: App['licenseType'] }) {
  const config: Record<App['licenseType'], { label: string; className: string; icon: string }> = {
    FREE: { label: 'ฟรี', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800', icon: '✓' },
    PAID: { label: 'เสียเงิน', className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800', icon: '$' },
    FREEMIUM: { label: 'ฟรีเมียม', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', icon: '★' },
    TRIAL: { label: 'ทดลอง', className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800', icon: '◷' },
  };

  const { label, className, icon } = config[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      <span className="text-[10px]">{icon}</span>
      {label}
    </span>
  );
}

function AppTypeBadge({ type }: { type: AppType }) {
  if (type === 'GENERAL') return null;

  const config: Record<Exclude<AppType, 'GENERAL'>, { label: string; className: string }> = {
    ENTERPRISE: { label: 'องค์กร', className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
    MANUAL: { label: 'ติดตั้งพิเศษ', className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
  };

  const { label, className } = config[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}

export function AppRow({ app }: AppRowProps) {
  const { isSelected, toggleSelection } = useSelection();
  const { isFavorite, toggleFavorite } = useFavorites();
  const selected = isSelected(app.id);
  const favorited = isFavorite(app.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(app.id);
  };

  const handleCheckboxChange = () => {
    toggleSelection(app);
  };

  return (
    <div
      className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
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
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
            selected
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 group-hover:border-indigo-400 dark:group-hover:border-indigo-500'
          }`}
        >
          {selected && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* App Icon */}
      <div className="relative flex-shrink-0">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-1.5 transition-transform duration-200 ${
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
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`font-semibold transition-colors ${selected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'}`}>
            {app.name}
          </span>
          <LicenseBadge type={app.licenseType} />
          <AppTypeBadge type={app.appType} />
          {app.hasInstallGuide && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              คู่มือ
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{app.description}</p>

        {/* Manual download link */}
        {app.appType === 'MANUAL' && app.manualDownloadUrl && (
          <a
            href={app.manualDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 mt-1.5 group/link"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="group-hover/link:underline">{app.manualDownloadFileName || 'ดาวน์โหลด'}</span>
          </a>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
          favorited
            ? 'text-rose-500 dark:text-rose-400'
            : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-rose-400 dark:hover:text-rose-500'
        }`}
        title={favorited ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
      >
        <svg
          className="w-5 h-5"
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

      {/* Detail Link */}
      <Link
        to={`/apps/${app.id}`}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
