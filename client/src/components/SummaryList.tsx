import type { App } from '../types';
import { useSelection } from '../context/SelectionContext';

function LicenseBadge({ type }: { type: App['licenseType'] }) {
  const config: Record<App['licenseType'], { label: string; className: string }> = {
    FREE: { label: 'ฟรี', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
    PAID: { label: 'เสียเงิน', className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' },
    FREEMIUM: { label: 'ฟรีเมียม', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
    TRIAL: { label: 'ทดลอง', className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
  };

  const safeConfig = config[type] || config.FREE;
  const { label, className } = safeConfig;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}

interface SummaryListProps {
  apps: App[];
}

export function SummaryList({ apps }: SummaryListProps) {
  const { removeFromSelection } = useSelection();

  if (apps.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">ยังไม่ได้เลือกซอฟต์แวร์ใด ๆ</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">กลับไปเลือกซอฟต์แวร์ที่ต้องการติดตั้ง</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {apps.map((app, index) => (
        <div
          key={app.id}
          className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md dark:hover:shadow-gray-900/20 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-4">
            {/* Number Badge */}
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold text-sm">
              {index + 1}
            </div>

            {/* App Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl p-1.5 border border-gray-100 dark:border-gray-600">
              <img
                src={app.iconUrl}
                alt={app.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>';
                }}
              />
            </div>

            {/* App Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{app.name}</span>
                <LicenseBadge type={app.licenseType} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{app.vendor || app.description}</p>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFromSelection(app.id)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
