import { Link, useSearchParams } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import { useAuth } from '../context/AuthContext';
import type { AppType } from '../types';

interface Tab {
  type: AppType;
  label: string;
}

const TABS: Tab[] = [
  { type: 'GENERAL', label: 'ทั่วไป' },
  { type: 'ENTERPRISE', label: 'องค์กร' },
  { type: 'MANUAL', label: 'ติดตั้งพิเศษ' },
];

export function Navbar() {
  const { selectionCount } = useSelection();
  const { user, signOut, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const currentType = (searchParams.get('type') as AppType) || 'GENERAL';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">KodLaewLong</span>
          </Link>

          {/* Center: Tab Navigation */}
          <div className="flex items-center space-x-1">
            {TABS.map((tab) => (
              <Link
                key={tab.type}
                to={`/?type=${tab.type}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentType === tab.type
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Right: Summary + Auth */}
          <div className="flex items-center space-x-4">
            <Link
              to="/summary"
              className="relative text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              สรุป
              {selectionCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {selectionCount}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {loading ? (
              <span className="text-gray-400 text-sm">...</span>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* Admin link */}
                {user.user_metadata?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-sm text-orange-600 hover:text-orange-700 px-3 py-2 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
