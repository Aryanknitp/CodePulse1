import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message, opts) => addToast({ type: 'success', message, ...opts }),
    error: (message, opts) => addToast({ type: 'error', message, ...opts }),
    info: (message, opts) => addToast({ type: 'info', message, ...opts }),
    warning: (message, opts) => addToast({ type: 'warning', message, ...opts }),
  };

  return (
    <AppContext.Provider value={{ toasts, removeToast, toast, syncStatus, setSyncStatus }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
