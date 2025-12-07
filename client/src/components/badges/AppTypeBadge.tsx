import { useTranslation } from 'react-i18next';
import type { AppType } from '../../types';

interface AppTypeBadgeProps {
  type: AppType;
}

const APP_TYPE_CONFIG: Record<Exclude<AppType, 'GENERAL'>, { labelKey: string; className: string }> = {
  ENTERPRISE: {
    labelKey: 'nav.enterprise',
    className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  },
  MANUAL: {
    labelKey: 'nav.manual',
    className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  },
};

export function AppTypeBadge({ type }: AppTypeBadgeProps) {
  const { t } = useTranslation();

  // Don't show badge for GENERAL type
  if (type === 'GENERAL') return null;

  const config = APP_TYPE_CONFIG[type as keyof typeof APP_TYPE_CONFIG];
  if (!config) return null;

  const { labelKey, className } = config;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {t(labelKey)}
    </span>
  );
}
