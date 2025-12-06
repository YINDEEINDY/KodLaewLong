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
      setError(err instanceof Error ? err.message : 'Error loading data');
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
    if (!confirm('Are you sure you want to delete this app?')) return;

    try {
      await adminApi.deleteApp(session.access_token, id);
      setApps(apps.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
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
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setMode('list');
    setFormData(emptyApp);
  }

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {mode === 'create' ? 'Add New App' : 'Edit App'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App ID *</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Select</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License</label>
                <select
                  value={formData.licenseType || 'FREE'}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as DbApp['licenseType'] })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="FREE">Free</option>
                  <option value="FREEMIUM">Freemium</option>
                  <option value="PAID">Paid</option>
                  <option value="TRIAL">Trial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App Type</label>
                <select
                  value={formData.appType || 'GENERAL'}
                  onChange={(e) => setFormData({ ...formData, appType: e.target.value as DbApp['appType'] })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="GENERAL">General</option>
                  <option value="ENTERPRISE">Enterprise</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon URL *</label>
                <input
                  type="url"
                  value={formData.iconUrl || ''}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website URL *</label>
                <input
                  type="url"
                  value={formData.officialWebsiteUrl || ''}
                  onChange={(e) => setFormData({ ...formData, officialWebsiteUrl: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Download URL</label>
                <input
                  type="url"
                  value={formData.officialDownloadUrl || ''}
                  onChange={(e) => setFormData({ ...formData, officialDownloadUrl: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.version || ''}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Install Guide</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasInstallGuide || false}
                  onChange={(e) => setFormData({ ...formData, hasInstallGuide: e.target.checked })}
                  className="h-5 w-5 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable Guide</span>
              </label>
            </div>

            {formData.hasInstallGuide && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guide Title</label>
                  <input
                    type="text"
                    value={formData.installGuideTitle || ''}
                    onChange={(e) => setFormData({ ...formData, installGuideTitle: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Steps (one per line)</label>
                    <textarea
                      value={formData.installGuideSteps || ''}
                      onChange={(e) => setFormData({ ...formData, installGuideSteps: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                      rows={8}
                      placeholder="Step 1&#10;Step 2&#10;Step 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview</label>
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
                        <p className="text-gray-400 text-sm text-center py-8">Enter steps to preview</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
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
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Apps</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add App
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Icon</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Category</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">License</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Guide</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredApps.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">Yes</span>
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
                  <button onClick={() => handleDelete(app.id)} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredApps.length} of {apps.length} apps
      </div>
    </div>
  );
}
