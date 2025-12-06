import type { CategoryWithApps } from '../types';
import { AppCategorySection } from './AppCategorySection';

interface AppGridProps {
  categories: CategoryWithApps[];
}

export function AppGrid({ categories }: AppGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <AppCategorySection key={category.slug} category={category} />
      ))}
    </div>
  );
}
