import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import type { UserInfo } from '../../api/adminApi';

export function AdminUsersPage() {
  const { session, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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

    // Confirmation for promoting to admin
    if (newRole === 'admin') {
      if (!confirm('คุณแน่ใจหรือไม่ที่จะให้ผู้ใช้นี้เป็น Admin?')) return;
    }

    // Confirmation for demoting from admin
    if (newRole === 'user') {
      if (!confirm('คุณแน่ใจหรือไม่ที่จะถอดสิทธิ์ Admin ของผู้ใช้นี้?')) return;
    }

    try {
      setUpdating(userId);
      await adminApi.updateUserRole(session.access_token, userId, newRole);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setUpdating(null);
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH');
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

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">จัดการผู้ใช้</h1>
        <div className="flex gap-4 text-sm">
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
            Admin: {adminCount}
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            User: {userCount}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">อีเมล</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Role</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">สมัครเมื่อ</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">เข้าสู่ระบบล่าสุด</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUser?.id;
              const isUpdating = updating === user.id;

              return (
                <tr key={user.id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.email}</span>
                      {isCurrentUser && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">คุณ</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.lastSignIn)}</td>
                  <td className="px-6 py-4">
                    {isCurrentUser ? (
                      <span className="text-gray-400 text-sm">-</span>
                    ) : isUpdating ? (
                      <span className="text-gray-400 text-sm">กำลังอัพเดท...</span>
                    ) : user.role === 'admin' ? (
                      <button
                        onClick={() => handleRoleChange(user.id, 'user')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ถอดสิทธิ์ Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(user.id, 'admin')}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        ให้สิทธิ์ Admin
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
