import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { DashboardStats } from '../../api/adminApi';

export function AdminDashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!session?.access_token) return;

      try {
        setLoading(true);
        const data = await adminApi.getStats(session.access_token);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [session?.access_token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">แดชบอร์ด</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">จำนวนแอปทั้งหมด</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalApps}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">จำนวนหมวดหมู่</div>
          <div className="text-3xl font-bold text-green-600">{stats.totalCategories}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">จำนวนการเลือกทั้งหมด</div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalSelections}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apps by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">แอปแยกตามหมวดหมู่</h2>
          <div className="space-y-3">
            {stats.appsByCategory.map((item) => (
              <div key={item.categoryName} className="flex justify-between items-center">
                <span className="text-gray-600">{item.categoryName}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {item.count} แอป
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Apps */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">แอปยอดนิยม</h2>
          {stats.popularApps.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {stats.popularApps.map((item, index) => (
                <div key={item.appId} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{item.appName}</span>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {item.selectionCount} ครั้ง
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
