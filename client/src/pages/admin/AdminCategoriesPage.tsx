import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { DbCategory } from '../../api/adminApi';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

type FormMode = 'list' | 'create' | 'edit';

const emptyCategory: Partial<DbCategory> = {
  id: '',
  name: '',
  slug: '',
  order: 0,
};

export function AdminCategoriesPage() {
  const { session } = useAuth();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<FormMode>('list');
  const [formData, setFormData] = useState<Partial<DbCategory>>(emptyCategory);
  const [saving, setSaving] = useState(false);
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
      const res = await adminApi.getCategories(session.access_token);
      setCategories(res.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setFormData({ ...emptyCategory, order: categories.length });
    setMode('create');
  }

  function handleEdit(category: DbCategory) {
    setFormData(category);
    setMode('edit');
  }

  async function handleDelete(id: string, name: string) {
    if (!session?.access_token) return;

    const confirmed = await confirm({
      title: 'ลบหมวดหมู่',
      message: `คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "${name}"?`,
      confirmText: 'ลบหมวดหมู่',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await adminApi.deleteCategory(session.access_token, id);
      setCategories(categories.filter((c) => c.id !== id));
      toast.success('ลบหมวดหมู่สำเร็จ');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;

    try {
      setSaving(true);
      if (mode === 'create') {
        const newCategory = await adminApi.createCategory(session.access_token, formData);
        setCategories([...categories, newCategory]);
        toast.success('เพิ่มหมวดหมู่สำเร็จ');
      } else {
        const updated = await adminApi.updateCategory(session.access_token, formData.id!, formData);
        setCategories(categories.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('บันทึกหมวดหมู่สำเร็จ');
      }
      setMode('list');
      setFormData(emptyCategory);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setMode('list');
    setFormData(emptyCategory);
  }

  // Bulk delete handlers
  const allSelected = categories.length > 0 && categories.every((c) => selectedItems.has(c.id));
  const someSelected = categories.some((c) => selectedItems.has(c.id));

  function handleSelectAll() {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(categories.map((c) => c.id)));
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
      title: 'ลบหมวดหมู่หลายรายการ',
      message: `คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ ${selectedItems.size} รายการ?`,
      confirmText: `ลบ ${selectedItems.size} รายการ`,
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      setBulkDeleting(true);
      const deletePromises = Array.from(selectedItems).map((id) =>
        adminApi.deleteCategory(session.access_token, id).catch((err) => ({ error: true, id, message: err.message }))
      );
      const results = await Promise.all(deletePromises);
      const failed = results.filter((r) => r && typeof r === 'object' && 'error' in r);

      if (failed.length > 0) {
        toast.error(`ลบไม่สำเร็จ ${failed.length} รายการ`);
      } else {
        toast.success(`ลบหมวดหมู่ ${selectedItems.size} รายการสำเร็จ`);
      }

      setCategories(categories.filter((c) => !selectedItems.has(c.id) || failed.some((f) => f.id === c.id)));
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
            {mode === 'create' ? 'เพิ่มหมวดหมู่ใหม่' : 'แก้ไขหมวดหมู่'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รหัสหมวดหมู่ *</label>
              <input
                type="text"
                value={formData.id || ''}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={mode === 'edit'}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                placeholder="เช่น browsers, media, dev-tools"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อหมวดหมู่ *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({
                    ...formData,
                    name,
                    slug: mode === 'create' ? generateSlug(name) : formData.slug,
                  });
                }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="เช่น เว็บเบราว์เซอร์, มีเดีย"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="เช่น browsers, media"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ลำดับการแสดง</label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                min={0}
              />
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">จัดการหมวดหมู่</h1>
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
            เพิ่มหมวดหมู่ใหม่
          </button>
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
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">ลำดับ</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">รหัส</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">ชื่อ</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Slug</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((category) => {
              const isSelected = selectedItems.has(category.id);
              return (
                <tr key={category.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                  <td className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectItem(category.id)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{category.order}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-300">{category.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{category.slug}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mr-4"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
