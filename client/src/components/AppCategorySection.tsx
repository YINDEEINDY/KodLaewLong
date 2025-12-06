import type { CategoryWithApps } from '../types';
import { AppRow } from './AppRow';

interface AppCategorySectionProps {
  category: CategoryWithApps;
}

export function AppCategorySection({ category }: AppCategorySectionProps) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h2>
      <div className="space-y-2">
        {category.apps.map((app) => (
          <AppRow key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
