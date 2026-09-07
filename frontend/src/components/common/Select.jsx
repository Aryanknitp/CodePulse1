export default function Select({ label, error, className = '', wrapperClassName = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && <label className="text-sm font-medium text-[#e8eaf0]">{label}</label>}
      <select
        className={`
          bg-[#111218] border rounded-md px-3 py-2 text-sm text-[#e8eaf0]
          transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent
          ${error ? 'border-[#ef4444]' : 'border-[#1e2030] hover:border-[#252840]'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}
