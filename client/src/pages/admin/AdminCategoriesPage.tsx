import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { DbCategory } from '../../api/adminApi';

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

  async function handleDelete(id: string) {
    if (!session?.access_token) return;
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?')) return;

    try {
      await adminApi.deleteCategory(session.access_token, id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
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
      } else {
        const updated = await adminApi.updateCategory(session.access_token, formData.id!, formData);
        setCategories(categories.map((c) => (c.id === updated.id ? updated : c)));
      }
      setMode('list');
      setFormData(emptyCategory);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setMode('list');
    setFormData(emptyCategory);
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
          {mode === 'create' ? 'เพิ่มหมวดหมู่ใหม่' : 'แก้ไขหมวดหมู่'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสหมวดหมู่ *</label>
              <input
                type="text"
                value={formData.id || ''}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={mode === 'edit'}
                className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                placeholder="เช่น browsers, media, dev-tools"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหมวดหมู่ *</label>
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
                className="w-full border rounded-lg px-3 py-2"
                placeholder="เช่น เว็บเบราว์เซอร์, มีเดีย"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="เช่น browsers, media"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ลำดับการแสดง</label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2"
                min={0}
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
        <h1 className="text-2xl font-bold">จัดการหมวดหมู่</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ลำดับ</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">รหัส</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ชื่อ</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Slug</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">{category.order}</td>
                <td className="px-6 py-4 font-mono text-sm">{category.id}</td>
                <td className="px-6 py-4 font-medium">{category.name}</td>
                <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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
