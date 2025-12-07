import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError('เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">ตรวจสอบอีเมลของคุณ</h2>
            <p className="text-slate-400 mb-6">
              เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยัง <span className="text-white">{email}</span> แล้ว
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            ลืมรหัสผ่าน?
          </h2>
          <p className="text-slate-400 text-center mb-6">
            กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                อีเมล
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            จำรหัสผ่านได้แล้ว?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
