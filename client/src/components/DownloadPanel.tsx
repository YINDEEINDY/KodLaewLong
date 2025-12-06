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
      <div className="card text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600">กำลังสร้างตัวติดตั้ง...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <div className="text-red-500 text-4xl mb-4">!</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={onRetry} className="btn-primary">
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="card text-center py-8 bg-green-50 border-green-200">
        <div className="text-green-500 text-4xl mb-4">✓</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">สร้างตัวติดตั้งสำเร็จ!</h3>
        <p className="text-gray-600 mb-4">
          Build ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{result.buildId}</code>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          สร้างเมื่อ: {new Date(result.generatedAt).toLocaleString('th-TH')}
        </p>
        <a
          href={result.downloadUrl}
          className="btn-primary inline-block"
          download
        >
          ดาวน์โหลดตัวติดตั้ง
        </a>
        <p className="text-xs text-gray-400 mt-4">
          หมายเหตุ: ไฟล์นี้เป็น mock สำหรับ MVP เท่านั้น
        </p>
      </div>
    );
  }

  return null;
}
