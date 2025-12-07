import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { DbChangelog, DbApp } from '../../api/adminApi';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

type FormMode = 'list' | 'create' | 'edit';

const emptyChangelog: Partial<DbChangelog> = {
  appId: '',
  version: '',
  releaseDate: new Date().toISOString().split('T')[0],
  changeType: 'update',
  title: '',
  description: '',
  changes: '',
  downloadUrl: '',
  isHighlighted: false,
};

const changeTypeLabels: Record<string, string> = {
  major: 'Major Update',
  minor: 'Minor Update',
  patch: 'Patch',
  security: 'Security Fix',
  update: 'Update',
};

const changeTypeBadgeColors: Record<string, string> = {
  major: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
  minor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
  patch: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  security: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
  update: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
};

export function AdminChangelogsPage() {
  const { session } = useAuth();
  const [changelogs, setChangelogs] = useState<DbChangelog[]>([]);
  const [apps, setApps] = useState<DbApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<FormMode>('list');
  const [formData, setFormData] = useState<Partial<DbChangelog>>(emptyChangelog);
  const [saving, setSaving] = useState(false);
  const [filterAppId, setFilterAppId] = useState<string>('');
  const { dialogProps, confirm } = useConfirmDialog();

  useEffect(() => {
    fetchData();
  }, [session?.access_token]);

  async function fetchData() {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const [changelogsRes, appsRes] = await Promise.all([
        adminApi.getChangelogs(session.access_token),
        adminApi.getApps(session.access_token),
      ]);
      setChangelogs(changelogsRes.changelogs);
      setApps(appsRes.apps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setFormData({ ...emptyChangelog, releaseDate: new Date().toISOString().split('T')[0] });
    setMode('create');
  }

  function handleEdit(changelog: DbChangelog) {
    setFormData({
      ...changelog,
      releaseDate: changelog.releaseDate.split('T')[0],
    });
    setMode('edit');
  }

  async function handleDelete(id: string, title: string) {
    if (!session?.access_token) return;

    const confirmed = await confirm({
      title: 'ลบ Changelog',
      message: `คุณแน่ใจหรือไม่ที่จะลบ changelog "${title}"?`,
      confirmText: 'ลบ Changelog',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await adminApi.deleteChangelog(session.access_token, id);
      setChangelogs(changelogs.filter((c) => c.id !== id));
      toast.success('ลบ changelog สำเร็จ');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;

    try {
      setSaving(true);
      if (mode === 'create') {
        const newChangelog = await adminApi.createChangelog(session.access_token, formData);
        const app = apps.find(a => a.id === newChangelog.appId);
        setChangelogs([{ ...newChangelog, appName: app?.name }, ...changelogs]);
        toast.success('เพิ่ม changelog สำเร็จ');
      } else {
        const updated = await adminApi.updateChangelog(session.access_token, formData.id!, formData);
        const app = apps.find(a => a.id === updated.appId);
        setChangelogs(changelogs.map((c) => (c.id === updated.id ? { ...updated, appName: app?.name } : c)));
        toast.success('บันทึก changelog สำเร็จ');
      }
      setMode('list');
      setFormData(emptyChangelog);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setMode('list');
    setFormData(emptyChangelog);
  }

  const filteredChangelogs = filterAppId
    ? changelogs.filter(c => c.appId === filterAppId)
    : changelogs;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
        {error}
      </div>
    );
  }

  // Form view
  if (mode !== 'list') {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'create' ? 'เพิ่ม Changelog ใหม่' : 'แก้ไข Changelog'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">แอป *</label>
              <select
                value={formData.appId || ''}
                onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">เลือกแอป</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">เวอร์ชัน *</label>
                <input
                  type="text"
                  value={formData.version || ''}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="เช่น 1.0.0, 2.5.3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">วันที่ออก *</label>
                <input
                  type="date"
                  value={formData.releaseDate || ''}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ประเภทการอัปเดต *</label>
              <select
                value={formData.changeType || 'update'}
                onChange={(e) => setFormData({ ...formData, changeType: e.target.value as DbChangelog['changeType'] })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="major">Major Update</option>
                <option value="minor">Minor Update</option>
                <option value="patch">Patch</option>
                <option value="security">Security Fix</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อเรื่อง *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="สรุปสั้นๆ เกี่ยวกับการอัปเดต"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รายละเอียด</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับการเปลี่ยนแปลง"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                การเปลี่ยนแปลง (บรรทัดละรายการ)
              </label>
              <textarea
                value={formData.changes || ''}
                onChange={(e) => setFormData({ ...formData, changes: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                rows={5}
                placeholder="- เพิ่มฟีเจอร์ใหม่ X&#10;- แก้ไขบัก Y&#10;- ปรับปรุงประสิทธิภาพ Z"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ใส่รายการเปลี่ยนแปลง บรรทัดละรายการ ขึ้นต้นด้วย - สำหรับ bullet points
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ลิงก์ดาวน์โหลด</label>
              <input
                type="url"
                value={formData.downloadUrl || ''}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isHighlighted"
                checked={formData.isHighlighted || false}
                onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isHighlighted" className="text-sm text-gray-700 dark:text-gray-300">
                ไฮไลท์การอัปเดตนี้ (แสดงเป็นรายการเด่น)
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">จัดการ Changelog</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่ม Changelog ใหม่
        </button>
      </div>

      {/* Filter by app */}
      <div className="mb-4">
        <select
          value={filterAppId}
          onChange={(e) => setFilterAppId(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">ทุกแอป</option>
          {apps.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
      </div>

      {filteredChangelogs.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          ไม่พบ changelog เพิ่ม changelog แรกของคุณ!
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">แอป</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">เวอร์ชัน</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">ประเภท</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">ชื่อเรื่อง</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">วันที่</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredChangelogs.map((changelog) => (
                <tr key={changelog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{changelog.appName || 'ไม่ทราบ'}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-300">
                    v{changelog.version}
                    {changelog.isHighlighted && (
                      <span className="ml-2 text-yellow-500" title="ไฮไลท์">
                        ★
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${changeTypeBadgeColors[changelog.changeType]}`}>
                      {changeTypeLabels[changelog.changeType]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 max-w-xs truncate" title={changelog.title}>
                    {changelog.title}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(changelog.releaseDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(changelog)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mr-4"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(changelog.id, changelog.title)}
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
