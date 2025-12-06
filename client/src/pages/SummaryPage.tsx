import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import { generateInstaller } from '../api/appsApi';
import { SummaryList } from '../components/SummaryList';
import { DownloadPanel } from '../components/DownloadPanel';
import type { App, AppType, GenerateResponse } from '../types';

const TYPE_LABELS: Record<AppType, string> = {
  GENERAL: 'ซอฟต์แวร์ทั่วไป',
  ENTERPRISE: 'ซอฟต์แวร์องค์กร',
  MANUAL: 'ติดตั้งพิเศษ',
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
  const { selectedApps, selectionCount } = useSelection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const paidApps = selectedApps.filter((app) => !app.isPublicFree);
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
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างตัวติดตั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (selectionCount === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">สรุปรายการซอฟต์แวร์ที่เลือก</h1>
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">ยังไม่ได้เลือกซอฟต์แวร์ใด ๆ</p>
          <Link to="/" className="btn-primary">
            กลับไปเลือกซอฟต์แวร์
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">สรุปรายการซอฟต์แวร์ที่เลือก</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
          ← กลับไปแก้ไข
        </Link>
      </div>

      {hasPaidApps && (
        <div className="card bg-yellow-50 border-yellow-200 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-yellow-500 text-xl">⚠</span>
            <div>
              <h3 className="font-medium text-yellow-800">ซอฟต์แวร์บางรายการต้องซื้อ License</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {paidApps.map((app) => app.name).join(', ')} ไม่สามารถติดตั้งฟรีได้
                กรุณาซื้อ License ก่อนใช้งาน
              </p>
            </div>
          </div>
        </div>
      )}

      {hasManualApps && (
        <div className="card bg-orange-50 border-orange-200 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-orange-500 text-xl">📋</span>
            <div>
              <h3 className="font-medium text-orange-800">โปรแกรมที่ต้องติดตั้งพิเศษ</h3>
              <p className="text-sm text-orange-700 mt-1">
                {manualApps.map((app) => app.name).join(', ')} ต้องดาวน์โหลดไฟล์พิเศษและทำตามขั้นตอน
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grouped apps by type */}
      {(['GENERAL', 'ENTERPRISE', 'MANUAL'] as AppType[]).map((type) => {
        const apps = groupedApps[type];
        if (!apps || apps.length === 0) return null;
        return (
          <div key={type} className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">
              {TYPE_LABELS[type]} ({apps.length} รายการ)
            </h2>
            <SummaryList apps={apps} />
          </div>
        );
      })}

      {!result && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary text-lg px-8 py-3"
          >
            {loading ? 'กำลังสร้าง...' : 'สร้างตัวติดตั้ง'}
          </button>
        </div>
      )}

      {(loading || error || result) && (
        <div className="mt-6">
          <DownloadPanel
            loading={loading}
            error={error}
            result={result}
            onRetry={handleGenerate}
          />
        </div>
      )}
    </div>
  );
}
