import React, { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, severity: 'success', message: '' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, severity, message });
  };

  const showSuccessToast = (message) => showToast(message, 'success');
  const showErrorToast = (message) => showToast(message, 'error');
  const hideToast = () => setToast((current) => ({ ...current, open: false }));

  const value = useMemo(
    () => ({ toast, showToast, showSuccessToast, showErrorToast, hideToast }),
    [toast],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext);
