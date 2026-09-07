import { useApp } from '../../context/AppContext.jsx';

const ICONS = {
  success: (
    <svg className="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function ToastItem({ toast, onRemove }) {
  return (
    <div className="flex items-start gap-3 bg-[#161820] border border-[#1e2030] rounded-lg p-3 shadow-xl min-w-[280px] max-w-sm" role="alert">
      <span className="mt-0.5 shrink-0">{ICONS[toast.type] || ICONS.info}</span>
      <p className="text-sm text-[#e8eaf0] flex-1">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-[#6b7280] hover:text-[#e8eaf0] shrink-0" aria-label="Dismiss">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
    </div>
  );
}
