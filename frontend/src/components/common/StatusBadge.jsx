const STATUS_STYLES = {
  success: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/20',
  error: 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/20',
  warning: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/20',
  info: 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/20',
  neutral: 'bg-[#6b7280]/15 text-[#9ca3af] border-[#6b7280]/20',
  primary: 'bg-[#6366f1]/15 text-[#818cf8] border-[#6366f1]/20',
};

export default function StatusBadge({ status = 'neutral', children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.neutral} ${className}`}>
      {children}
    </span>
  );
}
