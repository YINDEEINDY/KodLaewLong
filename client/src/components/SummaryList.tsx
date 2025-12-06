import type { App } from '../types';
import { useSelection } from '../context/SelectionContext';

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

interface SummaryListProps {
  apps: App[];
}

export function SummaryList({ apps }: SummaryListProps) {
  const { removeFromSelection } = useSelection();

  if (apps.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">ยังไม่ได้เลือกซอฟต์แวร์ใด ๆ</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {apps.map((app) => (
        <div
          key={app.id}
          className="card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{app.name}</span>
                <LicenseBadge type={app.licenseType} />
              </div>
              <p className="text-sm text-gray-500">{app.vendor}</p>
            </div>
          </div>
          <button
            onClick={() => removeFromSelection(app.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            ลบ
          </button>
        </div>
      ))}
    </div>
  );
}
