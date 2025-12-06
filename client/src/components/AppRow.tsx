import { Link } from 'react-router-dom';
import type { App, AppType } from '../types';
import { useSelection } from '../context/SelectionContext';

interface AppRowProps {
  app: App;
}

function LicenseBadge({ type }: { type: App['licenseType'] }) {
  const badgeClasses: Record<App['licenseType'], string> = {
    FREE: 'badge-free',
    PAID: 'badge-paid',
    FREEMIUM: 'badge-freemium',
    TRIAL: 'badge-trial',
  };

  const labels: Record<App['licenseType'], string> = {
    FREE: 'ฟรี',
    PAID: 'เสียเงิน',
    FREEMIUM: 'ฟรีเมียม',
    TRIAL: 'ทดลองใช้',
  };

  return <span className={`badge ${badgeClasses[type]}`}>{labels[type]}</span>;
}

function AppTypeBadge({ type }: { type: AppType }) {
  // Don't show badge for GENERAL apps (they're the default)
  if (type === 'GENERAL') return null;

  const config: Record<Exclude<AppType, 'GENERAL'>, { label: string; className: string }> = {
    ENTERPRISE: { label: 'องค์กร', className: 'bg-purple-100 text-purple-800' },
    MANUAL: { label: 'ติดตั้งพิเศษ', className: 'bg-orange-100 text-orange-800' },
  };

  const { label, className } = config[type];
  return <span className={`badge ${className}`}>{label}</span>;
}

export function AppRow({ app }: AppRowProps) {
  const { isSelected, toggleSelection } = useSelection();
  const selected = isSelected(app.id);

  const handleCheckboxChange = () => {
    toggleSelection(app);
  };

  return (
    <div
      className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
        selected
          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      onClick={handleCheckboxChange}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      <img
        src={app.iconUrl}
        alt={app.name}
        className="w-8 h-8 ml-3 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>';
        }}
      />
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 truncate">{app.name}</span>
          <LicenseBadge type={app.licenseType} />
          <AppTypeBadge type={app.appType} />
        </div>
        <p className="text-sm text-gray-500 truncate">{app.description}</p>
        {/* Show download link for manual apps */}
        {app.appType === 'MANUAL' && app.manualDownloadUrl && (
          <a
            href={app.manualDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-orange-600 hover:text-orange-800 hover:underline mt-1 inline-block"
          >
            ดาวน์โหลด: {app.manualDownloadFileName || 'ไฟล์ติดตั้ง'}
          </a>
        )}
      </div>
      <Link
        to={`/apps/${app.id}`}
        onClick={(e) => e.stopPropagation()}
        className="ml-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
      >
        รายละเอียด
      </Link>
    </div>
  );
}
