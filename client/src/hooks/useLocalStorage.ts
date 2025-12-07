import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for syncing state with localStorage
 * Handles serialization, error handling, and SSR compatibility
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  }
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;

  // Initialize state from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync to localStorage when value changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(key, serialize(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, serialize]);

  // Setter function that handles both direct values and updater functions
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      return nextValue;
    });
  }, []);

  // Clear function to remove from localStorage
  const clearValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
}

/**
 * Specialized hook for Set-based localStorage (e.g., favorites)
 */
export function useLocalStorageSet(
  key: string
): [Set<string>, {
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}] {
  const [value, setValue] = useLocalStorage<string[]>(key, []);
  const set = new Set(value);

  const actions = {
    add: useCallback((id: string) => {
      setValue((prev) => [...new Set([...prev, id])]);
    }, [setValue]),

    remove: useCallback((id: string) => {
      setValue((prev) => prev.filter((item) => item !== id));
    }, [setValue]),

    toggle: useCallback((id: string) => {
      setValue((prev) => {
        const set = new Set(prev);
        if (set.has(id)) {
          set.delete(id);
        } else {
          set.add(id);
        }
        return [...set];
      });
    }, [setValue]),

    has: useCallback((id: string) => set.has(id), [set]),

    clear: useCallback(() => {
      setValue([]);
    }, [setValue]),
  };

  return [set, actions];
}
