import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useConfirmDialog } from './useConfirmDialog';

describe('useConfirmDialog', () => {
  it('should start with dialog closed', () => {
    const { result } = renderHook(() => useConfirmDialog());
    expect(result.current.dialogProps.isOpen).toBe(false);
  });

  it('should open dialog with provided options', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({
        title: 'Test Title',
        message: 'Test Message',
      });
    });

    expect(result.current.dialogProps.isOpen).toBe(true);
    expect(result.current.dialogProps.title).toBe('Test Title');
    expect(result.current.dialogProps.message).toBe('Test Message');
  });

  it('should use default confirmText and cancelText', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test',
      });
    });

    expect(result.current.dialogProps.confirmText).toBe('ยืนยัน');
    expect(result.current.dialogProps.cancelText).toBe('ยกเลิก');
  });

  it('should use custom confirmText and cancelText', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test',
        confirmText: 'Yes',
        cancelText: 'No',
      });
    });

    expect(result.current.dialogProps.confirmText).toBe('Yes');
    expect(result.current.dialogProps.cancelText).toBe('No');
  });

  it('should use default variant (danger)', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test',
      });
    });

    expect(result.current.dialogProps.variant).toBe('danger');
  });

  it('should use custom variant', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test',
        variant: 'warning',
      });
    });

    expect(result.current.dialogProps.variant).toBe('warning');

    // Reset and test info variant
    act(() => {
      result.current.dialogProps.onCancel();
    });

    act(() => {
      result.current.confirm({
        title: 'Info',
        message: 'Info message',
        variant: 'info',
      });
    });

    expect(result.current.dialogProps.variant).toBe('info');
  });

  it('should close dialog on cancel', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test',
      });
    });

    expect(result.current.dialogProps.isOpen).toBe(true);

    act(() => {
      result.current.dialogProps.onCancel();
    });

    expect(result.current.dialogProps.isOpen).toBe(false);
  });

  it('should close dialog on confirm', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test',
      });
    });

    expect(result.current.dialogProps.isOpen).toBe(true);

    act(() => {
      result.current.dialogProps.onConfirm();
    });

    expect(result.current.dialogProps.isOpen).toBe(false);
  });

  it('should resolve promise with true on confirm', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    let resolvedValue: boolean | undefined;

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Test',
      }).then((value) => {
        resolvedValue = value;
      });
    });

    await act(async () => {
      result.current.dialogProps.onConfirm();
    });

    expect(resolvedValue).toBe(true);
  });

  it('should reset to initial state after cancel', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({
        title: 'Custom Title',
        message: 'Custom Message',
        confirmText: 'Custom Confirm',
        cancelText: 'Custom Cancel',
        variant: 'warning',
      });
    });

    act(() => {
      result.current.dialogProps.onCancel();
    });

    expect(result.current.dialogProps.isOpen).toBe(false);
    expect(result.current.dialogProps.title).toBe('');
    expect(result.current.dialogProps.message).toBe('');
  });
});
