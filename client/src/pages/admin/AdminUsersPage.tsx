import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { UserInfo } from '../../api/adminApi';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

export function AdminUsersPage() {
  const { session, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
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

  // Get selectable users (exclude current user)
  const selectableUsers = users.filter((u) => u.id !== currentUser?.id);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">จัดการผู้ใช้</h1>
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
              {bulkDeleting ? 'กำลังลบ...' : `ลบที่เลือก (${selectedUsers.size})`}
            </button>
          )}
          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full">
            Admin: {adminCount}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">
            User: {userCount}
          </span>
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
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">อีเมล</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">สมัครเมื่อ</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">เข้าสู่ระบบล่าสุด</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => {
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
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded">คุณ</span>
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
                      <span className="text-gray-400 dark:text-gray-500 text-sm">กำลังดำเนินการ...</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        {user.role === 'admin' ? (
                          <button
                            onClick={() => handleRoleChange(user.id, 'user')}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 text-sm"
                          >
                            ถอดสิทธิ์ Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(user.id, 'admin')}
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm"
                          >
                            ให้สิทธิ์ Admin
                          </button>
                        )}
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 text-sm"
                        >
                          ลบ
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

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
