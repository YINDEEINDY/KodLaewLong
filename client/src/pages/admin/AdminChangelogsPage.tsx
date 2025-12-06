import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { DbChangelog, DbApp } from '../../api/adminApi';

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
  major: 'bg-purple-100 text-purple-800',
  minor: 'bg-blue-100 text-blue-800',
  patch: 'bg-gray-100 text-gray-800',
  security: 'bg-red-100 text-red-800',
  update: 'bg-green-100 text-green-800',
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

  async function handleDelete(id: string) {
    if (!session?.access_token) return;
    if (!confirm('Are you sure you want to delete this changelog?')) return;

    try {
      await adminApi.deleteChangelog(session.access_token, id);
      setChangelogs(changelogs.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
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
      } else {
        const updated = await adminApi.updateChangelog(session.access_token, formData.id!, formData);
        const app = apps.find(a => a.id === updated.appId);
        setChangelogs(changelogs.map((c) => (c.id === updated.id ? { ...updated, appName: app?.name } : c)));
      }
      setMode('list');
      setFormData(emptyChangelog);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
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
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          {mode === 'create' ? 'Add New Changelog' : 'Edit Changelog'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App *</label>
              <select
                value={formData.appId || ''}
                onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select an app</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version *</label>
                <input
                  type="text"
                  value={formData.version || ''}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 1.0.0, 2.5.3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Release Date *</label>
                <input
                  type="date"
                  value={formData.releaseDate || ''}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Change Type *</label>
              <select
                value={formData.changeType || 'update'}
                onChange={(e) => setFormData({ ...formData, changeType: e.target.value as DbChangelog['changeType'] })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="major">Major Update</option>
                <option value="minor">Minor Update</option>
                <option value="patch">Patch</option>
                <option value="security">Security Fix</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="Brief summary of the update"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Detailed description of the changes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Changes (one per line)
              </label>
              <textarea
                value={formData.changes || ''}
                onChange={(e) => setFormData({ ...formData, changes: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white font-mono text-sm"
                rows={5}
                placeholder="- Added new feature X&#10;- Fixed bug in Y&#10;- Improved performance of Z"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                List changes, one per line. Start with - for bullet points.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Download URL</label>
              <input
                type="url"
                value={formData.downloadUrl || ''}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isHighlighted"
                checked={formData.isHighlighted || false}
                onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isHighlighted" className="text-sm text-gray-700 dark:text-gray-300">
                Highlight this update (show as featured)
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
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
        <h1 className="text-2xl font-bold dark:text-white">Manage Changelogs</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Changelog
        </button>
      </div>

      {/* Filter by app */}
      <div className="mb-4">
        <select
          value={filterAppId}
          onChange={(e) => setFilterAppId(e.target.value)}
          className="border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Apps</option>
          {apps.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
      </div>

      {filteredChangelogs.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
          No changelogs found. Add your first changelog!
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">App</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Version</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Type</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Title</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredChangelogs.map((changelog) => (
                <tr key={changelog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <span className="font-medium dark:text-white">{changelog.appName || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm dark:text-gray-300">
                    v{changelog.version}
                    {changelog.isHighlighted && (
                      <span className="ml-2 text-yellow-500" title="Highlighted">
                        ★
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${changeTypeBadgeColors[changelog.changeType]}`}>
                      {changeTypeLabels[changelog.changeType]}
                    </span>
                  </td>
                  <td className="px-6 py-4 dark:text-gray-300 max-w-xs truncate" title={changelog.title}>
                    {changelog.title}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(changelog.releaseDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(changelog)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(changelog.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
