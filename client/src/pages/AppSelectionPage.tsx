import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AppType, CategoryWithApps } from '../types';
import { getApps } from '../api/appsApi';
import { AppGrid } from '../components/AppGrid';
import { BottomBar } from '../components/BottomBar';

const TYPE_TITLES: Record<AppType, { title: string; subtitle: string }> = {
  GENERAL: {
    title: 'ซอฟต์แวร์ทั่วไป',
    subtitle: 'โปรแกรมฟรีและโอเพนซอร์สสำหรับการใช้งานทั่วไป',
  },
  ENTERPRISE: {
    title: 'ซอฟต์แวร์องค์กร',
    subtitle: 'โปรแกรมที่ต้องใช้ License องค์กรหรือ Internal Tools',
  },
  MANUAL: {
    title: 'ติดตั้งพิเศษ',
    subtitle: 'โปรแกรมที่ต้องดาวน์โหลดไฟล์พิเศษและทำตามขั้นตอน',
  },
};

export function AppSelectionPage() {
  const [searchParams] = useSearchParams();
  const appType = (searchParams.get('type') as AppType) || 'GENERAL';

  const [categories, setCategories] = useState<CategoryWithApps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = async (type: AppType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getApps(type);
      setCategories(response.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps(appType);
  }, [appType]);

  const { title, subtitle } = TYPE_TITLES[appType];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        <div className="card text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => fetchApps(appType)} className="btn-primary">
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-2">ยังไม่มีโปรแกรมในหมวดหมู่นี้</p>
          <p className="text-sm text-gray-400">
            {appType === 'ENTERPRISE' && 'รอข้อมูลโปรแกรมจากองค์กร'}
            {appType === 'MANUAL' && 'รอเพิ่มโปรแกรมที่ต้องติดตั้งพิเศษ'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{subtitle}</p>
      </div>
      <AppGrid categories={categories} />
      <BottomBar />
    </div>
  );
}
