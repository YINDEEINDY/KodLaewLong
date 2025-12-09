import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryWithApps } from '../types';
import { AppRow } from './AppRow';
import { useSelection } from '../context/SelectionContext';

interface AppCategorySectionProps {
  category: CategoryWithApps;
}

// Category icons mapping
const categoryIcons: Record<string, string> = {
  browser: '🌐',
  communication: '💬',
  development: '💻',
  productivity: '📊',
  multimedia: '🎬',
  utilities: '🔧',
  security: '🔒',
  gaming: '🎮',
  design: '🎨',
  office: '📁',
};

function getCategoryIcon(slug: string): string {
  return categoryIcons[slug.toLowerCase()] || '📦';
}

export function AppCategorySection({ category }: AppCategorySectionProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const { isSelected, addToSelection, removeFromSelection } = useSelection();

  const selectedCount = category.apps.filter(app => isSelected(app.id)).length;
  const allSelected = selectedCount === category.apps.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allSelected) {
      // Deselect all
      category.apps.forEach(app => removeFromSelection(app.id));
    } else {
      // Select all
      category.apps.forEach(app => {
        if (!isSelected(app.id)) {
          addToSelection(app);
        }
      });
    }
  };

  return (
    <div className="card group/card overflow-hidden">
      {/* Category Header */}
      <div
        className="flex items-center justify-between cursor-pointer -mx-5 -mt-5 px-5 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getCategoryIcon(category.slug)}</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{category.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.apps.length} {t('appCategory.apps')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Select All Button */}
          <button
            onClick={handleSelectAll}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              allSelected
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/70'
                : someSelected
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {allSelected ? (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('appCategory.selectAll')}
              </span>
            ) : (
              `${t('appCategory.selectAll')}${someSelected ? ` (${selectedCount})` : ''}`
            )}
          </button>

          {/* Expand/Collapse Icon */}
          <div className={`p-1 rounded-lg transition-all ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Apps List */}
      <div className={`transition-all duration-300 ${isExpanded ? 'mt-4' : 'h-0 overflow-hidden opacity-0'}`}>
        <div className="space-y-2">
          {category.apps.map((app) => (
            <AppRow key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  );
}
