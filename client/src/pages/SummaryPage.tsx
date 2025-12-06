import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useSelection } from '../context/SelectionContext';
import { generateInstaller } from '../api/appsApi';
import { SummaryList } from '../components/SummaryList';
import { DownloadPanel } from '../components/DownloadPanel';
import type { App, AppType, GenerateResponse } from '../types';

interface ExportData {
  version: string;
  exportedAt: string;
  apps: App[];
}

const TYPE_CONFIG: Record<AppType, { labelKey: string; icon: string; gradient: string }> = {
  GENERAL: { labelKey: 'summary.appTypes.general', icon: '🚀', gradient: 'from-indigo-500 to-purple-500' },
  ENTERPRISE: { labelKey: 'summary.appTypes.enterprise', icon: '🏢', gradient: 'from-blue-500 to-cyan-500' },
  MANUAL: { labelKey: 'summary.appTypes.manual', icon: '🔧', gradient: 'from-orange-500 to-red-500' },
};

function groupAppsByType(apps: App[]): Record<AppType, App[]> {
  return apps.reduce((acc, app) => {
    const type = app.appType || 'GENERAL';
    if (!acc[type]) acc[type] = [];
    acc[type].push(app);
    return acc;
  }, {} as Record<AppType, App[]>);
}

export function SummaryPage() {
  const { t } = useTranslation();
  const { selectedApps, selectionCount, importApps } = useSelection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paidApps = selectedApps.filter((app) => !app.isPublicFree);

  // Export selections to JSON file
  const handleExport = () => {
    const exportData: ExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      apps: selectedApps,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kodlaewlong-selection-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('toast.exportSuccess'));
  };

  // Import selections from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData;
        if (data.version && Array.isArray(data.apps)) {
          importApps(data.apps);
          toast.success(t('summary.importSuccess', { count: data.apps.length }));
        } else {
          throw new Error('Invalid format');
        }
      } catch {
        toast.error(t('summary.importError'));
      }
    };
    reader.readAsText(file);
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const hasPaidApps = paidApps.length > 0;
  const manualApps = selectedApps.filter((app) => app.appType === 'MANUAL');
  const hasManualApps = manualApps.length > 0;
  const groupedApps = groupAppsByType(selectedApps);

  const handleGenerate = async () => {
    console.log('Starting generate with apps:', selectedApps.map(a => a.id));
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const appIds = selectedApps.map((app) => app.id);
      const response = await generateInstaller(appIds);
      console.log('Generate success:', response);
      setResult(response);
    } catch (err) {
      console.error('Generate error:', err);
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (selectionCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Empty State */}
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('summary.empty.title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('summary.empty.subtitle')}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('summary.empty.backButton')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-white text-xs sm:text-sm mb-3 sm:mb-4 group"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('summary.backToEdit')}
          </Link>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{t('summary.title')}</h1>
                <p className="text-white/80 text-sm sm:text-base">{selectionCount} {t('summary.appsSelected')}</p>
              </div>
            </div>

            {/* Export/Import Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                title={t('summary.export')}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {t('summary.export')}
              </button>
              <label className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('summary.import')}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        {/* Warnings */}
        {hasPaidApps && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 mb-4 sm:mb-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-amber-800 dark:text-amber-300">{t('summary.warnings.paidTitle')}</h3>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 mt-0.5 sm:mt-1 break-words">
                  {paidApps.map((app) => app.name).join(', ')} {t('summary.warnings.paidDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {hasManualApps && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 mb-4 sm:mb-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-orange-800 dark:text-orange-300">{t('summary.warnings.manualTitle')}</h3>
                <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-400 mt-0.5 sm:mt-1 break-words">
                  {manualApps.map((app) => app.name).join(', ')} {t('summary.warnings.manualDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grouped apps by type */}
        {(['GENERAL', 'ENTERPRISE', 'MANUAL'] as AppType[]).map((type) => {
          const apps = groupedApps[type];
          if (!apps || apps.length === 0) return null;
          const config = TYPE_CONFIG[type];

          return (
            <div key={type} className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${config.gradient} rounded-lg sm:rounded-xl flex items-center justify-center text-white text-sm sm:text-lg shadow-lg`}>
                  {config.icon}
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">{t(config.labelKey)}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{apps.length} {t('summary.items')}</p>
                </div>
              </div>
              <SummaryList apps={apps} />
            </div>
          );
        })}

        {/* Generate Button */}
        {!result && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="group flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-300 dark:hover:shadow-emerald-800/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('summary.generating')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('summary.generate')}
                </>
              )}
            </button>
          </div>
        )}

        {/* Download Panel */}
        {(loading || error || result) && (
          <div className="mt-8">
            <DownloadPanel
              loading={loading}
              error={error}
              result={result}
              onRetry={handleGenerate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
