import { useTranslation } from 'react-i18next';
import type { LicenseType } from '../../types';

interface LicenseBadgeProps {
  type: LicenseType;
}

const LICENSE_CONFIG: Record<LicenseType, { labelKey: string; className: string; icon: string }> = {
  FREE: {
    labelKey: 'appSelection.license.free',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    icon: '✓',
  },
  PAID: {
    labelKey: 'appSelection.license.paid',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
    icon: '$',
  },
  FREEMIUM: {
    labelKey: 'appSelection.license.freemium',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    icon: '★',
  },
  TRIAL: {
    labelKey: 'appSelection.license.trial',
    className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    icon: '◷',
  },
};

export function LicenseBadge({ type }: LicenseBadgeProps) {
  const { t } = useTranslation();
  const config = LICENSE_CONFIG[type] || LICENSE_CONFIG.FREE;
  const { labelKey, className, icon } = config;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      <span className="text-[10px]">{icon}</span>
      {t(labelKey)}
    </span>
  );
}
