import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import * as statsApi from '../../api/statsApi';
import type { DashboardStats } from '../../api/adminApi';

interface BuildStats {
  totalBuilds: number;
  totalDownloads: number;
  totalAppsSelected: number;
  buildsToday: number;
  downloadsToday: number;
}

interface BuildWithApps {
  id: string;
  buildId: string;
  appCount: number;
  downloadCount: number;
  createdAt: string;
  lastDownloadAt: string | null;
  apps: string[];
}

export function AdminDashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [buildStats, setBuildStats] = useState<BuildStats | null>(null);
  const [recentBuilds, setRecentBuilds] = useState<BuildWithApps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.access_token) return;

      try {
        setLoading(true);

        // Fetch all data in parallel
        const [adminStats, buildStatsData, buildsData] = await Promise.all([
          adminApi.getStats(session.access_token),
          statsApi.fetchDashboardStats(session.access_token),
          statsApi.fetchRecentBuilds(session.access_token, 5),
        ]);

        setStats(adminStats);
        setBuildStats(buildStatsData);
        setRecentBuilds(buildsData.builds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">แอปทั้งหมด</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalApps}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">หมวดหมู่</div>
          <div className="text-2xl font-bold text-green-600">{stats.totalCategories}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">การเลือกทั้งหมด</div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalSelections}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">Builds ทั้งหมด</div>
          <div className="text-2xl font-bold text-orange-600">{buildStats?.totalBuilds || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">Downloads ทั้งหมด</div>
          <div className="text-2xl font-bold text-red-600">{buildStats?.totalDownloads || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">แอปที่ถูกเลือก</div>
          <div className="text-2xl font-bold text-teal-600">{buildStats?.totalAppsSelected || 0}</div>
        </div>
      </div>

      {/* Today Stats */}
      {buildStats && (buildStats.buildsToday > 0 || buildStats.downloadsToday > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="text-blue-100 text-sm">Builds วันนี้</div>
            <div className="text-3xl font-bold">{buildStats.buildsToday}</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="text-green-100 text-sm">Downloads วันนี้</div>
            <div className="text-3xl font-bold">{buildStats.downloadsToday}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-200 text-gray-600'
                    }`}>
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

      {/* Recent Builds */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Builds ล่าสุด</h2>
        {recentBuilds.length === 0 ? (
          <p className="text-gray-500">ยังไม่มี builds</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">Build ID</th>
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">จำนวนแอป</th>
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">Downloads</th>
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">สร้างเมื่อ</th>
                  <th className="text-left py-2 px-4 text-gray-500 font-medium">Download ล่าสุด</th>
                </tr>
              </thead>
              <tbody>
                {recentBuilds.map((build) => (
                  <tr key={build.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {build.buildId.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="py-2 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {build.appCount} แอป
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        build.downloadCount > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {build.downloadCount} ครั้ง
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-600 text-sm">
                      {new Date(build.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="py-2 px-4 text-gray-600 text-sm">
                      {build.lastDownloadAt
                        ? new Date(build.lastDownloadAt).toLocaleString('th-TH')
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
