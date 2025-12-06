import type { GenerateResponse } from '../types';

interface DownloadPanelProps {
  loading: boolean;
  error: string | null;
  result: GenerateResponse | null;
  onRetry: () => void;
}

export function DownloadPanel({ loading, error, result, onRetry }: DownloadPanelProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center shadow-lg">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">กำลังสร้างตัวติดตั้ง</h3>
        <p className="text-gray-500 dark:text-gray-400">กรุณารอสักครู่...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">เกิดข้อผิดพลาด</h3>
        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-8 text-center">
        {/* Success Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/50 rounded-full animate-ping opacity-25"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">สร้างตัวติดตั้งสำเร็จ!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">ตัวติดตั้งพร้อมใช้งานแล้ว</p>

        {/* Build Info */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 mb-6 inline-block">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Build ID:</span>
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs text-gray-700 dark:text-gray-300">
                {result.buildId}
              </code>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-gray-500 dark:text-gray-400">
              {new Date(result.generatedAt).toLocaleString('th-TH')}
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div>
          <a
            href={result.downloadUrl}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-300 dark:hover:shadow-emerald-800/40 hover:-translate-y-0.5 transition-all"
            download
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            ดาวน์โหลดตัวติดตั้ง
          </a>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
          หมายเหตุ: ไฟล์นี้เป็น mock สำหรับ MVP เท่านั้น
        </p>
      </div>
    );
  }

  return null;
}
