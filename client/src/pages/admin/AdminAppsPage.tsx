import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { DbApp, DbCategory } from '../../api/adminApi';

type FormMode = 'list' | 'create' | 'edit';

const emptyApp: Partial<DbApp> = {
  id: '',
  name: '',
  categoryId: '',
  description: '',
  iconUrl: '',
  licenseType: 'FREE',
  appType: 'GENERAL',
  isPublicFree: true,
  officialWebsiteUrl: '',
  officialDownloadUrl: '',
  hasInstallGuide: false,
};

export function AdminAppsPage() {
  const { session } = useAuth();
  const [apps, setApps] = useState<DbApp[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<FormMode>('list');
  const [formData, setFormData] = useState<Partial<DbApp>>(emptyApp);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [session?.access_token]);

  async function fetchData() {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const [appsRes, catsRes] = await Promise.all([
        adminApi.getApps(session.access_token),
        adminApi.getCategories(session.access_token),
      ]);
      setApps(appsRes.apps);
      setCategories(catsRes.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setFormData(emptyApp);
    setMode('create');
  }

  function handleEdit(app: DbApp) {
    setFormData(app);
    setMode('edit');
  }

  async function handleDelete(id: string) {
    if (!session?.access_token) return;
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแอปนี้?')) return;

    try {
      await adminApi.deleteApp(session.access_token, id);
      setApps(apps.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;

    try {
      setSaving(true);
      if (mode === 'create') {
        const newApp = await adminApi.createApp(session.access_token, formData);
        setApps([...apps, newApp]);
      } else {
        const updated = await adminApi.updateApp(session.access_token, formData.id!, formData);
        setApps(apps.map((a) => (a.id === updated.id ? updated : a)));
      }
      setMode('list');
      setFormData(emptyApp);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setMode('list');
    setFormData(emptyApp);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>;
  }

  // Form view
  if (mode !== 'list') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">
          {mode === 'create' ? 'เพิ่มแอปใหม่' : 'แก้ไขแอป'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสแอป *</label>
              <input
                type="text"
                value={formData.id || ''}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={mode === 'edit'}
                className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อแอป *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ *</label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท License</label>
              <select
                value={formData.licenseType || 'FREE'}
                onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as DbApp['licenseType'] })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="FREE">ฟรี</option>
                <option value="FREEMIUM">Freemium</option>
                <option value="PAID">เสียเงิน</option>
                <option value="TRIAL">ทดลองใช้</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทแอป</label>
              <select
                value={formData.appType || 'GENERAL'}
                onChange={(e) => setFormData({ ...formData, appType: e.target.value as DbApp['appType'] })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="GENERAL">ทั่วไป</option>
                <option value="ENTERPRISE">องค์กร</option>
                <option value="MANUAL">ติดตั้งเอง</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL ไอคอน *</label>
              <input
                type="url"
                value={formData.iconUrl || ''}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL เว็บไซต์ *</label>
              <input
                type="url"
                value={formData.officialWebsiteUrl || ''}
                onChange={(e) => setFormData({ ...formData, officialWebsiteUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL ดาวน์โหลด</label>
              <input
                type="url"
                value={formData.officialDownloadUrl || ''}
                onChange={(e) => setFormData({ ...formData, officialDownloadUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">จัดการแอป</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + เพิ่มแอปใหม่
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ไอคอน</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ชื่อ</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">หมวดหมู่</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">License</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <img
                    src={app.iconUrl}
                    alt={app.name}
                    className="w-10 h-10 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                    }}
                  />
                </td>
                <td className="px-6 py-4 font-medium">{app.name}</td>
                <td className="px-6 py-4 text-gray-500">
                  {categories.find((c) => c.id === app.categoryId)?.name || app.categoryId}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      app.licenseType === 'FREE'
                        ? 'bg-green-100 text-green-800'
                        : app.licenseType === 'PAID'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {app.licenseType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(app)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
