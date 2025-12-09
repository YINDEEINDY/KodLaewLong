import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { UserInfo } from '../../api/adminApi';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

export function AdminUsersPage() {
  const { t } = useTranslation();
  const { session, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const { dialogProps, confirm } = useConfirmDialog();

  useEffect(() => {
    fetchUsers();
  }, [session?.access_token]);

  async function fetchUsers() {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const res = await adminApi.getUsers(session.access_token);
      setUsers(res.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: 'user' | 'admin') {
    if (!session?.access_token) return;

    const isPromoting = newRole === 'admin';
    const confirmed = await confirm({
      title: isPromoting ? 'ให้สิทธิ์ Admin' : 'ถอดสิทธิ์ Admin',
      message: isPromoting
        ? 'คุณแน่ใจหรือไม่ที่จะให้ผู้ใช้นี้เป็น Admin?\nผู้ใช้จะสามารถเข้าถึงหน้าจัดการระบบได้'
        : 'คุณแน่ใจหรือไม่ที่จะถอดสิทธิ์ Admin ของผู้ใช้นี้?',
      confirmText: isPromoting ? 'ให้สิทธิ์' : 'ถอดสิทธิ์',
      variant: isPromoting ? 'warning' : 'danger',
    });

    if (!confirmed) return;

    try {
      setUpdating(userId);
      await adminApi.updateUserRole(session.access_token, userId, newRole);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success(newRole === 'admin' ? 'ให้สิทธิ์ Admin สำเร็จ' : 'ถอดสิทธิ์ Admin สำเร็จ');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setUpdating(null);
    }
  }

  async function handleDeleteUser(userId: string, email: string) {
    if (!session?.access_token) return;

    const confirmed = await confirm({
      title: 'ลบผู้ใช้',
      message: `คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${email}"?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้!`,
      confirmText: 'ลบผู้ใช้',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      setUpdating(userId);
      await adminApi.deleteUser(session.access_token, userId);
      setUsers(users.filter((u) => u.id !== userId));
      toast.success('ลบผู้ใช้สำเร็จ');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    } finally {
      setUpdating(null);
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH');
  }

  // Filter users based on search query and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === '' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Get selectable users (exclude current user) from filtered list
  const selectableUsers = filteredUsers.filter((u) => u.id !== currentUser?.id);
  const allSelected = selectableUsers.length > 0 && selectableUsers.every((u) => selectedUsers.has(u.id));
  const someSelected = selectableUsers.some((u) => selectedUsers.has(u.id));

  function handleSelectAll() {
    if (allSelected) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(selectableUsers.map((u) => u.id)));
    }
  }

  function handleSelectUser(userId: string) {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  }

  async function handleBulkDelete() {
    if (!session?.access_token || selectedUsers.size === 0) return;

    const confirmed = await confirm({
      title: 'ลบผู้ใช้หลายคน',
      message: `คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ ${selectedUsers.size} คน?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้!`,
      confirmText: `ลบ ${selectedUsers.size} คน`,
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      setBulkDeleting(true);
      const deletePromises = Array.from(selectedUsers).map((id) =>
        adminApi.deleteUser(session.access_token, id)
          .then(() => ({ success: true, id }))
          .catch((err) => ({ success: false, id, message: err.message }))
      );
      const results = await Promise.all(deletePromises);
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        toast.error(`ลบไม่สำเร็จ ${failed.length} คน`);
      } else {
        toast.success(`ลบผู้ใช้ ${selectedUsers.size} คนสำเร็จ`);
      }

      const failedIds = new Set(failed.map((f) => f.id));
      setUsers(users.filter((u) => !selectedUsers.has(u.id) || failedIds.has(u.id)));
      setSelectedUsers(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบผู้ใช้');
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

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.manageUsers')}</h1>
        <div className="flex gap-4 text-sm items-center">
          {selectedUsers.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-rose-700 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {bulkDeleting ? t('admin.deleting') : `${t('admin.deleteSelected')} (${selectedUsers.size})`}
            </button>
          )}
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full">
            {t('admin.stats.adminCount')}: {adminCount}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">
            {t('admin.stats.userCount')}: {userCount}
          </span>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t('admin.table.email') + '...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-w-[130px]"
        >
          <option value="">{t('common.all')} {t('admin.table.role')}</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        {(searchQuery || filterRole) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterRole('');
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('admin.clearFilters')}
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-900 dark:text-gray-100 text-lg font-medium mb-1">{t('admin.empty.users.title')}</p>
          <p className="text-gray-500 dark:text-gray-400">{t('admin.empty.users.description')}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-900 dark:text-gray-100 text-lg font-medium mb-1">{t('admin.empty.apps.noResults')}</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('admin.empty.apps.noResultsDesc')}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterRole('');
            }}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('admin.clearFilters')}
          </button>
        </div>
      ) : (
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
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.table.email')}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.table.role')}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.table.registeredAt')}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.table.lastSignIn')}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                const isUpdating = updating === user.id;
                const isSelected = selectedUsers.has(user.id);

                return (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isCurrentUser ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                    <td className="w-12 px-4 py-4">
                      {isCurrentUser ? (
                        <span className="text-gray-300 dark:text-gray-600">-</span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{user.email}</span>
                        {isCurrentUser && (
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded">{t('admin.actions.you')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(user.lastSignIn)}</td>
                    <td className="px-6 py-4">
                      {isCurrentUser ? (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                      ) : isUpdating ? (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">{t('admin.processing')}</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          {user.role === 'admin' ? (
                            <button
                              onClick={() => handleRoleChange(user.id, 'user')}
                              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 text-sm"
                            >
                              {t('admin.actions.revokeAdmin')}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(user.id, 'admin')}
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm"
                            >
                              {t('admin.actions.grantAdmin')}
                            </button>
                          )}
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 text-sm"
                          >
                            {t('admin.actions.delete')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {users.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {t('admin.show')} {filteredUsers.length} {t('admin.of')} {users.length} {t('admin.items')}
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
