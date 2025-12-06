import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelection } from '../context/SelectionContext';

export function BottomBar() {
  const { t } = useTranslation();
  const { selectionCount, clearSelection } = useSelection();

  if (selectionCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Selection info */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                  <span className="text-white font-bold text-base sm:text-lg">{selectionCount}</span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                  {t('bottomBar.selectedCount', { count: selectionCount })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{t('bottomBar.viewSummary')}</p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Clear Selection Button */}
            <button
              onClick={() => clearSelection()}
              className="flex items-center justify-center p-2 sm:px-4 sm:py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg sm:rounded-xl transition-all"
              title={t('common.clearAll')}
            >
              <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline ml-2">{t('common.clearAll')}</span>
            </button>

            {/* Continue Button */}
            <Link
              to="/summary"
              className="group flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-800/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>{t('bottomBar.proceed')}</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Progress bar animation - hidden on very small screens */}
        <div className="hidden sm:block mt-3 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((selectionCount / 10) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
