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
          <p className="text-red-600 text-lg mb-4">{error || 'ไม่พบซอฟต์แวร์'}</p>
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-6 group"
      >
        <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        กลับไปเลือกซอฟต์แวร์
      </Link>

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
              <h1 className="text-3xl font-bold text-gray-900">{app.name}</h1>
              <LicenseBadge type={app.licenseType} />
              {app.hasInstallGuide && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  มีคู่มือติดตั้ง
                </span>
              )}
            </div>

            {app.vendor && (
              <p className="text-gray-500 mb-2">โดย {app.vendor}</p>
            )}

            {app.version && (
              <p className="text-sm text-gray-400">เวอร์ชัน {app.version}</p>
            )}

            <p className="text-gray-700 mt-4">{app.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
          <button
            onClick={handleToggle}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selected
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {selected ? '✓ อยู่ในรายการแล้ว - คลิกเพื่อลบ' : '+ เพิ่มในรายการติดตั้ง'}
          </button>
        </div>
      </div>

      {/* Download Links Card */}
      {(app.officialWebsiteUrl || app.officialDownloadUrl || app.manualDownloadUrl) && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            ลิงก์ดาวน์โหลด
          </h2>

          <div className="grid gap-3">
            {app.officialWebsiteUrl && (
              <a
                href={app.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">เว็บไซต์ทางการ</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{app.officialWebsiteUrl}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {app.officialDownloadUrl && (
              <a
                href={app.officialDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ดาวน์โหลดโดยตรง</p>
                    <p className="text-sm text-gray-500">คลิกเพื่อดาวน์โหลดไฟล์ติดตั้ง</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {app.manualDownloadUrl && (
              <a
                href={app.manualDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ดาวน์โหลดไฟล์ {app.manualDownloadFileName || 'ติดตั้ง'}</p>
                    <p className="text-sm text-gray-500">ต้องติดตั้งด้วยตัวเอง</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {app.installGuideTitle || 'วิธีการติดตั้ง'}
          </h2>

          <div className="space-y-4">
            {app.installGuideSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-700">{step}</p>
                </div>
              </div>
            ))}
          </div>

          {app.installNotes && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800 mb-1">หมายเหตุ</p>
                  <p className="text-sm text-yellow-700">{app.installNotes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Install Guide */}
      {!app.hasInstallGuide && (
        <div className="card text-center py-8 bg-gray-50">
          <div className="text-4xl mb-3">✨</div>
          <p className="text-gray-600 font-medium">ติดตั้งง่าย ไม่มีขั้นตอนพิเศษ</p>
          <p className="text-gray-500 text-sm mt-1">เพียงดาวน์โหลดและเปิดไฟล์ติดตั้ง</p>
        </div>
      )}
    </div>
  );
}
