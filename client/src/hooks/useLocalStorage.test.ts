import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage, useLocalStorageSet } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value from localStorage', () => {
    // Mock getItem to return a stored value
    vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update value and sync to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should support updater function', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(6);
  });

  it('should clear value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('some-value');
    });

    expect(result.current[0]).toBe('some-value');

    act(() => {
      result.current[2](); // clearValue
    });

    expect(result.current[0]).toBe('initial');
    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('should handle complex objects', () => {
    const initialObj = { name: 'test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('test-key', initialObj));

    expect(result.current[0]).toEqual(initialObj);

    act(() => {
      result.current[1]({ name: 'updated', count: 5 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', count: 5 });
  });

  it('should handle arrays', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('test-key', []));

    act(() => {
      result.current[1](['item1', 'item2']);
    });

    expect(result.current[0]).toEqual(['item1', 'item2']);
  });

  it('should use custom serializer/deserializer', () => {
    const serialize = (value: Date) => value.toISOString();
    const deserialize = (value: string) => new Date(value);

    const initialDate = new Date('2024-01-01');
    const { result } = renderHook(() =>
      useLocalStorage('test-key', initialDate, { serialize, deserialize })
    );

    expect(result.current[0]).toEqual(initialDate);
  });
});

describe('useLocalStorageSet', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return empty set initially', () => {
    const { result } = renderHook(() => useLocalStorageSet('test-set'));
    expect(result.current[0].size).toBe(0);
  });

  it('should add item to set', () => {
    const { result } = renderHook(() => useLocalStorageSet('test-set'));

    act(() => {
      result.current[1].add('item1');
    });

    expect(result.current[0].has('item1')).toBe(true);
  });

  it('should remove item from set', () => {
    const { result } = renderHook(() => useLocalStorageSet('test-set'));

    act(() => {
      result.current[1].add('item1');
      result.current[1].add('item2');
    });

    act(() => {
      result.current[1].remove('item1');
    });

    expect(result.current[0].has('item1')).toBe(false);
    expect(result.current[0].has('item2')).toBe(true);
  });

  it('should toggle item in set', () => {
    const { result } = renderHook(() => useLocalStorageSet('test-set'));

    // Add via toggle
    act(() => {
      result.current[1].toggle('item1');
    });
    expect(result.current[0].has('item1')).toBe(true);

    // Remove via toggle
    act(() => {
      result.current[1].toggle('item1');
    });
    expect(result.current[0].has('item1')).toBe(false);
  });

  it('should check if item exists with has()', () => {
    const { result } = renderHook(() => useLocalStorageSet('test-set'));

    expect(result.current[1].has('item1')).toBe(false);

    act(() => {
      result.current[1].add('item1');
    });

    expect(result.current[1].has('item1')).toBe(true);
  });

  it('should clear all items', () => {
    const { result } = renderHook(() => useLocalStorageSet('test-set'));

    act(() => {
      result.current[1].add('item1');
      result.current[1].add('item2');
      result.current[1].add('item3');
    });

    expect(result.current[0].size).toBe(3);

    act(() => {
      result.current[1].clear();
    });

    expect(result.current[0].size).toBe(0);
  });

  it('should not add duplicate items', () => {
    const { result } = renderHook(() => useLocalStorageSet('test-set'));

    act(() => {
      result.current[1].add('item1');
      result.current[1].add('item1');
      result.current[1].add('item1');
    });

    expect(result.current[0].size).toBe(1);
  });
});
