import { useState, useCallback } from 'react';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const initialState: ConfirmDialogState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'ยืนยัน',
  cancelText: 'ยกเลิก',
  variant: 'danger',
  onConfirm: () => {},
};

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>(initialState);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'ยืนยัน',
        cancelText: options.cancelText || 'ยกเลิก',
        variant: options.variant || 'danger',
        onConfirm: () => {
          setState(initialState);
          resolve(true);
        },
      });
    });
  }, []);

  const handleCancel = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    dialogProps: {
      isOpen: state.isOpen,
      title: state.title,
      message: state.message,
      confirmText: state.confirmText,
      cancelText: state.cancelText,
      variant: state.variant,
      onConfirm: state.onConfirm,
      onCancel: handleCancel,
    },
    confirm,
  };
}
