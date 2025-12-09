import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAppById, getAppChangelogs, type AppChangelog } from '../api/appsApi';
import { useSelection } from '../context/SelectionContext';
import { useFavorites } from '../context/FavoritesContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import type { App } from '../types';

function LicenseBadge({ type }: { type: App['licenseType'] }) {
  const { t } = useTranslation();
  const badgeClasses: Record<App['licenseType'], string> = {
    FREE: 'badge-free',
    PAID: 'badge-paid',
    FREEMIUM: 'badge-freemium',
    TRIAL: 'badge-trial',
  };

  const labelKeys: Record<App['licenseType'], string> = {
    FREE: 'appSelection.license.free',
    PAID: 'appSelection.license.paid',
    FREEMIUM: 'appSelection.license.freemium',
    TRIAL: 'appSelection.license.trial',
  };

  return <span className={`badge ${badgeClasses[type]} text-sm`}>{t(labelKeys[type])}</span>;
}

export function AppDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<App | null>(null);
  const [changelogs, setChangelogs] = useState<AppChangelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllChangelogs, setShowAllChangelogs] = useState(false);
  const { isSelected, addToSelection, removeFromSelection } = useSelection();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [appData, changelogsData] = await Promise.all([
          getAppById(id),
          getAppChangelogs(id).catch(() => ({ changelogs: [] })),
        ]);
        setApp(appData);
        setChangelogs(changelogsData.changelogs);
        // Add to recently viewed
        addToRecentlyViewed(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('appDetail.notFound'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, addToRecentlyViewed]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-600 text-lg mb-4">{error || t('appDetail.notFound')}</p>
          <Link to="/" className="btn-primary">
            {t('nav.home')}
          </Link>
        </div>
      </div>
    );
  }

  const selected = isSelected(app.id);

  const handleToggle = () => {
    if (selected) {
      removeFromSelection(app.id);
    } else {
      addToSelection(app);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>{t('appDetail.breadcrumb.home')}</span>
        </Link>
        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-500 dark:text-gray-400">{t('appDetail.breadcrumb.apps')}</span>
        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]" title={app.name}>
          {app.name}
        </span>
      </nav>

      {/* App Header Card */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-24 h-24 object-contain rounded-xl bg-gray-50 p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>';
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{app.name}</h1>
              <LicenseBadge type={app.licenseType} />
              {app.hasInstallGuide && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400">
                  {t('appDetail.hasInstallGuide')}
                </span>
              )}
            </div>

            {app.vendor && (
              <p className="text-gray-500 dark:text-gray-400 mb-2">{t('appDetail.by')} {app.vendor}</p>
            )}

            {app.version && (
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('appDetail.version')} {app.version}</p>
            )}

            <p className="text-gray-700 dark:text-gray-300 mt-4">{app.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
          <button
            onClick={handleToggle}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selected
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {selected ? t('appDetail.inList') : t('appDetail.addToList')}
          </button>

          <button
            onClick={() => toggleFavorite(app.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isFavorite(app.id)
                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={isFavorite(app.id) ? 'currentColor' : 'none'}
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
            {isFavorite(app.id) ? t('appDetail.isFavorite') : t('appDetail.addFavorite')}
          </button>
        </div>
      </div>

      {/* Download Links Card */}
      {(app.officialWebsiteUrl || app.officialDownloadUrl || app.manualDownloadUrl) && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('appDetail.downloads.title')}
          </h2>

          <div className="grid gap-3">
            {app.officialWebsiteUrl && (
              <a
                href={app.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('appDetail.downloads.website')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{app.officialWebsiteUrl}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {app.officialDownloadUrl && (
              <a
                href={app.officialDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('appDetail.downloads.direct')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('appDetail.downloads.directDesc')}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {app.manualDownloadUrl && (
              <a
                href={app.manualDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('appDetail.downloads.manual')} {app.manualDownloadFileName || ''}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('appDetail.downloads.manualDesc')}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Install Guide Card */}
      {app.hasInstallGuide && app.installGuideSteps && app.installGuideSteps.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {app.installGuideTitle || t('appDetail.installGuide.title')}
          </h2>

          <div className="space-y-4">
            {app.installGuideSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-700 dark:text-gray-300">{step}</p>
                </div>
              </div>
            ))}
          </div>

          {app.installNotes && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">{t('appDetail.installGuide.notes')}</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">{app.installNotes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Install Guide */}
      {!app.hasInstallGuide && (
        <div className="card text-center py-8 bg-gray-50 dark:bg-gray-800">
          <div className="text-4xl mb-3">✨</div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">{t('appDetail.noGuide.title')}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('appDetail.noGuide.subtitle')}</p>
        </div>
      )}

      {/* Changelog Section */}
      {changelogs.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {t('appDetail.changelog.title', 'Version History')}
          </h2>

          <div className="space-y-4">
            {(showAllChangelogs ? changelogs : changelogs.slice(0, 3)).map((changelog) => (
              <div
                key={changelog.id}
                className={`p-4 rounded-lg border ${
                  changelog.isHighlighted
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">v{changelog.version}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    changelog.changeType === 'major' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                    changelog.changeType === 'minor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                    changelog.changeType === 'patch' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                    changelog.changeType === 'security' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                  }`}>
                    {changelog.changeType === 'major' ? 'Major' :
                     changelog.changeType === 'minor' ? 'Minor' :
                     changelog.changeType === 'patch' ? 'Patch' :
                     changelog.changeType === 'security' ? 'Security' : 'Update'}
                  </span>
                  {changelog.isHighlighted && (
                    <span className="text-yellow-500" title="Featured">★</span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    {new Date(changelog.releaseDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{changelog.title}</h3>

                {changelog.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{changelog.description}</p>
                )}

                {changelog.changes && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <ul className="list-disc list-inside space-y-1">
                      {changelog.changes.split('\n').filter(line => line.trim()).map((change, idx) => (
                        <li key={idx}>{change.replace(/^[-*]\s*/, '')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {changelog.downloadUrl && (
                  <a
                    href={changelog.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('appDetail.changelog.download', 'Download this version')}
                  </a>
                )}
              </div>
            ))}
          </div>

          {changelogs.length > 3 && (
            <button
              onClick={() => setShowAllChangelogs(!showAllChangelogs)}
              className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
            >
              {showAllChangelogs
                ? t('appDetail.changelog.showLess', 'Show less')
                : t('appDetail.changelog.showMore', `Show all ${changelogs.length} versions`)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
