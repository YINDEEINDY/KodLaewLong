import { Link } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';

export function BottomBar() {
  const { selectionCount, clearSelection } = useSelection();

  if (selectionCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50" />

      <div className="relative max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Selection info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                  <span className="text-white font-bold text-lg">{selectionCount}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  เลือกแล้ว {selectionCount} รายการ
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">พร้อมดำเนินการติดตั้ง</p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Clear Selection Button */}
            <button
              onClick={() => clearSelection()}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">ล้างทั้งหมด</span>
            </button>

            {/* Continue Button */}
            <Link
              to="/summary"
              className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-800/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>ดำเนินการต่อ</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((selectionCount / 10) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
