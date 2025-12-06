import { Link } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';

export function BottomBar() {
  const { selectionCount } = useSelection();

  if (selectionCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-gray-700">
          เลือกแล้ว <span className="font-bold text-blue-600">{selectionCount}</span> รายการ
        </div>
        <Link to="/summary" className="btn-primary">
          ดำเนินการต่อ
        </Link>
      </div>
    </div>
  );
}
