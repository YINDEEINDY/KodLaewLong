import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { DbApp, DbCategory } from '../../api/adminApi';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

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
  installGuideTitle: '',
  installGuideSteps: '',
  installNotes: '',
  version: '',
  vendor: '',
  manualDownloadUrl: '',
  manualDownloadFileName: '',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterLicense, setFilterLicense] = useState<string>('');
  const [filterAppType, setFilterAppType] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { dialogProps, confirm } = useConfirmDialog();

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
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
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

  async function handleDelete(id: string, name: string) {
    if (!session?.access_token) return;

    const confirmed = await confirm({
      title: 'ลบแอป',
      message: `คุณแน่ใจหรือไม่ที่จะลบแอป "${name}"?`,
      confirmText: 'ลบแอป',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await adminApi.deleteApp(session.access_token, id);
      setApps(apps.filter((a) => a.id !== id));
      toast.success('ลบแอปสำเร็จ');
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
        const newApp = await adminApi.createApp(session.access_token, formData);
        setApps([...apps, newApp]);
        toast.success('เพิ่มแอปสำเร็จ');
      } else {
        const updated = await adminApi.updateApp(session.access_token, formData.id!, formData);
        setApps(apps.map((a) => (a.id === updated.id ? updated : a)));
        toast.success('บันทึกแอปสำเร็จ');
      }
      setMode('list');
      setFormData(emptyApp);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setMode('list');
    setFormData(emptyApp);
  }

  const filteredApps = apps.filter(app => {
    // Text search filter
    const matchesSearch = searchQuery === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = filterCategory === '' || app.categoryId === filterCategory;

    // License type filter
    const matchesLicense = filterLicense === '' || app.licenseType === filterLicense;

    // App type filter
    const matchesAppType = filterAppType === '' || app.appType === filterAppType;

    return matchesSearch && matchesCategory && matchesLicense && matchesAppType;
  });

  const activeFiltersCount = [filterCategory, filterLicense, filterAppType].filter(f => f !== '').length;

  // Bulk delete handlers
  const allSelected = filteredApps.length > 0 && filteredApps.every((a) => selectedItems.has(a.id));
  const someSelected = filteredApps.some((a) => selectedItems.has(a.id));

  function handleSelectAll() {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredApps.map((a) => a.id)));
    }
  }

  function handleSelectItem(id: string) {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  }

  async function handleBulkDelete() {
    if (!session?.access_token || selectedItems.size === 0) return;

    const confirmed = await confirm({
      title: 'ลบแอปหลายรายการ',
      message: `คุณแน่ใจหรือไม่ที่จะลบแอป ${selectedItems.size} รายการ?`,
      confirmText: `ลบ ${selectedItems.size} รายการ`,
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      setBulkDeleting(true);
      const deletePromises = Array.from(selectedItems).map((id) =>
        adminApi.deleteApp(session.access_token, id)
          .then(() => ({ success: true, id }))
          .catch((err) => ({ success: false, id, message: err.message }))
      );
      const results = await Promise.all(deletePromises);
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        toast.error(`ลบไม่สำเร็จ ${failed.length} รายการ`);
      } else {
        toast.success(`ลบแอป ${selectedItems.size} รายการสำเร็จ`);
      }

      const failedIds = new Set(failed.map((f) => f.id));
      setApps(apps.filter((a) => !selectedItems.has(a.id) || failedIds.has(a.id)));
      setSelectedItems(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setBulkDeleting(false);
    }
  }

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

  if (mode !== 'list') {
    const guideStepsArray = formData.installGuideSteps?.split('\n').filter(s => s.trim()) || [];

    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'create' ? 'เพิ่มแอปใหม่' : 'แก้ไขแอป'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">ข้อมูลทั่วไป</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รหัสแอป *</label>
                <input
                  type="text"
                  value={formData.id || ''}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  disabled={mode === 'edit'}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อแอป *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">หมวดหมู่ *</label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">เลือก</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ใบอนุญาต</label>
                <select
                  value={formData.licenseType || 'FREE'}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as DbApp['licenseType'] })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="FREE">ฟรี</option>
                  <option value="FREEMIUM">Freemium</option>
                  <option value="PAID">เสียเงิน</option>
                  <option value="TRIAL">ทดลองใช้</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ประเภทแอป</label>
                <select
                  value={formData.appType || 'GENERAL'}
                  onChange={(e) => setFormData({ ...formData, appType: e.target.value as DbApp['appType'] })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="GENERAL">ทั่วไป</option>
                  <option value="ENTERPRISE">องค์กร</option>
                  <option value="MANUAL">ติดตั้งเอง</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL ไอคอน *</label>
                <input
                  type="url"
                  value={formData.iconUrl || ''}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">คำอธิบาย *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL เว็บไซต์ *</label>
                <input
                  type="url"
                  value={formData.officialWebsiteUrl || ''}
                  onChange={(e) => setFormData({ ...formData, officialWebsiteUrl: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL ดาวน์โหลด</label>
                <input
                  type="url"
                  value={formData.officialDownloadUrl || ''}
                  onChange={(e) => setFormData({ ...formData, officialDownloadUrl: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">เวอร์ชัน</label>
                <input
                  type="text"
                  value={formData.version || ''}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ผู้พัฒนา</label>
                <input
                  type="text"
                  value={formData.vendor || ''}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">คู่มือการติดตั้ง</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasInstallGuide || false}
                  onChange={(e) => setFormData({ ...formData, hasInstallGuide: e.target.checked })}
                  className="h-5 w-5 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">เปิดใช้คู่มือ</span>
              </label>
            </div>

            {formData.hasInstallGuide && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อคู่มือ</label>
                  <input
                    type="text"
                    value={formData.installGuideTitle || ''}
                    onChange={(e) => setFormData({ ...formData, installGuideTitle: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ขั้นตอน (บรรทัดละขั้นตอน)</label>
                    <textarea
                      value={formData.installGuideSteps || ''}
                      onChange={(e) => setFormData({ ...formData, installGuideSteps: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                      rows={8}
                      placeholder="ขั้นตอนที่ 1&#10;ขั้นตอนที่ 2&#10;ขั้นตอนที่ 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ตัวอย่าง</label>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 min-h-[200px]">
                      {guideStepsArray.length > 0 ? (
                        <div className="space-y-3">
                          {guideStepsArray.map((step, idx) => (
                            <div key={idx} className="flex gap-3">
                              <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                {idx + 1}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm pt-1">{step}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-8">ใส่ขั้นตอนเพื่อดูตัวอย่าง</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">หมายเหตุ</label>
                  <textarea
                    value={formData.installNotes || ''}
                    onChange={(e) => setFormData({ ...formData, installNotes: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">จัดการแอป</h1>
        <div className="flex gap-3 items-center">
          {selectedItems.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-rose-700 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {bulkDeleting ? 'กำลังลบ...' : `ลบที่เลือก (${selectedItems.size})`}
            </button>
          )}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มแอปใหม่
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {/* Search and filters row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส หรือคำอธิบาย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-w-[150px]"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* License type filter */}
          <select
            value={filterLicense}
            onChange={(e) => setFilterLicense(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-w-[130px]"
          >
            <option value="">ทุกใบอนุญาต</option>
            <option value="FREE">ฟรี</option>
            <option value="FREEMIUM">Freemium</option>
            <option value="PAID">เสียเงิน</option>
            <option value="TRIAL">ทดลองใช้</option>
          </select>

          {/* App type filter */}
          <select
            value={filterAppType}
            onChange={(e) => setFilterAppType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-w-[130px]"
          >
            <option value="">ทุกประเภท</option>
            <option value="GENERAL">ทั่วไป</option>
            <option value="ENTERPRISE">องค์กร</option>
            <option value="MANUAL">ติดตั้งเอง</option>
          </select>

          {/* Clear filters button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterLicense('');
                setFilterAppType('');
                setSearchQuery('');
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              ล้างตัวกรอง ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="w-12 px-4 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">ไอคอน</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">ชื่อ</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">หมวดหมู่</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">ใบอนุญาต</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">คู่มือ</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredApps.map((app) => {
              const isSelected = selectedItems.has(app.id);
              return (
                <tr key={app.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                  <td className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectItem(app.id)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                  <img src={app.iconUrl} alt={app.name} className="w-10 h-10 rounded-lg object-contain bg-gray-100 dark:bg-gray-700 p-1" />
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{app.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{app.id}</p>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {categories.find((c) => c.id === app.categoryId)?.name || app.categoryId}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    app.licenseType === 'FREE' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' :
                    app.licenseType === 'PAID' ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400' :
                    'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                  }`}>
                    {app.licenseType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {app.hasInstallGuide ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400">มี</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(app)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(app.id, app.name)} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        แสดง {filteredApps.length} จาก {apps.length} แอป
      </div>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
