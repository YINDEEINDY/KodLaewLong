import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { App } from '../types';
import { useAuth } from './AuthContext';
import * as selectionsApi from '../api/selectionsApi';

interface SelectionContextType {
  selectedIds: Set<string>;
  selectedApps: App[];
  isSelected: (id: string) => boolean;
  toggleSelection: (app: App) => void;
  addToSelection: (app: App) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  importApps: (apps: App[]) => void;
  selectionCount: number;
  isSyncing: boolean;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

interface SelectionProviderProps {
  children: ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const { t } = useTranslation();
  const [selectedApps, setSelectedApps] = useState<App[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { session } = useAuth();
  const isInitialLoad = useRef(true);
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedIds = new Set(selectedApps.map((app) => app.id));

  // Load selections from server when user logs in
  useEffect(() => {
    async function loadSelections() {
      if (!session?.access_token) {
        // User logged out - keep local selections
        isInitialLoad.current = true;
        return;
      }

      try {
        setIsSyncing(true);
        const savedAppIds = await selectionsApi.getSelections(session.access_token);

        if (savedAppIds.length > 0) {
          // We only have IDs from backend, so we create placeholder apps
          // The actual app data will be hydrated when the apps list loads
          setSelectedApps((currentApps) => {
            // Merge: keep apps we already have, add new IDs as placeholders
            const currentIds = new Set(currentApps.map((a) => a.id));
            const newApps = savedAppIds
              .filter((id) => !currentIds.has(id))
              .map((id) => ({ id } as App)); // Placeholder - will be hydrated
            return [...currentApps.filter((a) => savedAppIds.includes(a.id)), ...newApps];
          });
        }
        isInitialLoad.current = false;
      } catch (error) {
        console.error('Failed to load selections:', error);
      } finally {
        setIsSyncing(false);
      }
    }

    loadSelections();
  }, [session?.access_token]);

  // Debounced save to server when selections change
  useEffect(() => {
    if (isInitialLoad.current || !session?.access_token) {
      return;
    }

    // Clear pending save
    if (pendingSaveRef.current) {
      clearTimeout(pendingSaveRef.current);
    }

    // Debounce save by 500ms to avoid too many API calls
    pendingSaveRef.current = setTimeout(async () => {
      try {
        const appIds = selectedApps.map((a) => a.id);
        await selectionsApi.saveSelections(session.access_token, appIds);
      } catch (error) {
        console.error('Failed to save selections:', error);
      }
    }, 500);

    return () => {
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
    };
  }, [selectedApps, session?.access_token]);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggleSelection = useCallback((app: App) => {
    setSelectedApps((prev) => {
      const exists = prev.some((a) => a.id === app.id);
      if (exists) {
        toast(t('toast.appRemoved', { name: app.name }), {
          icon: '🗑️',
        });
        return prev.filter((a) => a.id !== app.id);
      }
      toast.success(t('toast.appAdded', { name: app.name }));
      return [...prev, app];
    });
  }, [t]);

  const addToSelection = useCallback((app: App) => {
    setSelectedApps((prev) => {
      const existingIndex = prev.findIndex((a) => a.id === app.id);
      if (existingIndex >= 0) {
        // Update existing (might be placeholder)
        const updated = [...prev];
        updated[existingIndex] = app;
        return updated;
      }
      return [...prev, app];
    });
  }, []);

  const removeFromSelection = useCallback((id: string) => {
    setSelectedApps((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedApps((prev) => {
      if (prev.length > 0) {
        toast(t('toast.selectionCleared'), {
          icon: '🧹',
        });
      }
      return [];
    });
  }, [t]);

  const importApps = useCallback((apps: App[]) => {
    setSelectedApps(apps);
  }, []);

  const value: SelectionContextType = {
    selectedIds,
    selectedApps,
    isSelected,
    toggleSelection,
    addToSelection,
    removeFromSelection,
    clearSelection,
    importApps,
    selectionCount: selectedApps.length,
    isSyncing,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextType {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}
