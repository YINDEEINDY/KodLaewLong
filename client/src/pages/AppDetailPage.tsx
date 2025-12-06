import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAppById } from '../api/appsApi';
import { useSelection } from '../context/SelectionContext';
import type { App } from '../types';

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

  return <span className={`badge ${badgeClasses[type]} text-sm`}>{labels[type]}</span>;
}

export function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSelected, addToSelection, removeFromSelection } = useSelection();

  useEffect(() => {
    if (!id) return;

    const fetchApp = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAppById(id);
        setApp(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ไม่พบซอฟต์แวร์');
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-red-600 mb-4">{error || 'ไม่พบซอฟต์แวร์'}</p>
          <Link to="/" className="btn-primary">
            กลับไปหน้าหลัก
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        ← กลับไปเลือกซอฟต์แวร์
      </Link>

      <div className="card">
        <div className="flex items-start gap-4 mb-6">
          <img
            src={app.iconUrl}
            alt={app.name}
            className="w-16 h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>';
            }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
              <LicenseBadge type={app.licenseType} />
            </div>
            {app.vendor && <p className="text-gray-500">{app.vendor}</p>}
          </div>
        </div>

        <p className="text-gray-700 mb-6">{app.description}</p>

        <div className="flex flex-wrap gap-4 mb-6">
          {app.officialWebsiteUrl && (
            <a
              href={app.officialWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              เว็บไซต์ทางการ →
            </a>
          )}
          {app.officialDownloadUrl && (
            <a
              href={app.officialDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              ดาวน์โหลดโดยตรง →
            </a>
          )}
        </div>

        <button
          onClick={handleToggle}
          className={selected ? 'btn-secondary' : 'btn-primary'}
        >
          {selected ? 'ลบออกจากรายการ' : 'เพิ่มในรายการติดตั้ง'}
        </button>
      </div>

      {app.hasInstallGuide && app.installGuideSteps && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {app.installGuideTitle || 'วิธีการติดตั้ง'}
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            {app.installGuideSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          {app.installNotes && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>หมายเหตุ:</strong> {app.installNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {!app.hasInstallGuide && (
        <div className="card mt-6 text-center py-8">
          <p className="text-gray-500">
            ซอฟต์แวร์นี้ติดตั้งง่าย ไม่มีขั้นตอนพิเศษ
          </p>
        </div>
      )}
    </div>
  );
}
